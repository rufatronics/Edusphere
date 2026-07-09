import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const department = formData.get('department') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Limit size to 10MB for free tier stability
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (Max 10MB)' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `buk-resources/${fileName}`

    // Use Server-Side Secret Token
    const hfToken = process.env.HF_TOKEN
    const hfDataset = process.env.NEXT_PUBLIC_HF_DATASET

    if (!hfToken || !hfDataset) {
      console.error('Missing HF Configuration')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Convert file to base64 for HF Commit API
    const bytes = await file.arrayBuffer()
    const base64Content = Buffer.from(bytes).toString('base64')

    // Upload to Hugging Face via Commit API (Upload API is retired)
    const hfResponse = await fetch(
      `https://huggingface.co/api/datasets/${hfDataset}/commit/main`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Upload resource: ${file.name}`,
          operations: [
            {
              operation: 'add',
              path: filePath,
              content: base64Content,
            }
          ]
        }),
      }
    )

    const hfData = await hfResponse.json()

    if (!hfResponse.ok) {
      console.error('HF Commit API Error:', hfData)
      return NextResponse.json({
        error: 'Hugging Face upload failed',
        debug: hfData
      }, { status: 502 })
    }

    // Generate direct download URL
    const publicUrl = `https://huggingface.co/datasets/${hfDataset}/resolve/main/${filePath}`

    // Store metadata in Supabase
    const { data: resource, error: dbError } = await supabase.from('resources').insert([
      {
        uploader_id: user.id,
        title: file.name,
        file_url: publicUrl,
        file_type: fileExt,
        department: department || 'General',
        storage_provider: 'huggingface',
        hf_path: filePath
      },
    ]).select().single()

    if (dbError) {
      // Cleanup HF if DB fails
      await fetch(
        `https://huggingface.co/api/datasets/${hfDataset}/commit/main`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: `Cleanup orphaned file: ${filePath}`,
            operations: [
              {
                operation: 'delete',
                path: filePath
              }
            ]
          })
        }
      ).catch(() => console.error('Failed to cleanup orphaned HF file'))

      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, resource, hf_debug: hfData })
  } catch (error: any) {
    console.error('Resource Upload API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
