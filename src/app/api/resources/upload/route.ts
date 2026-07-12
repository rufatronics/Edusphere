import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] Resource Upload Started`)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn(`[${requestId}] Unauthorized upload attempt`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const department = formData.get('department') as string

    if (!file) {
      console.warn(`[${requestId}] No file provided in form data`)
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`[${requestId}] Uploading file: ${file.name} (${file.size} bytes) for user: ${user.id}`)

    // Limit size to 10MB for free tier stability
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`[${requestId}] File size exceeds 10MB limit`)
      return NextResponse.json({ error: 'File too large (Max 10MB)' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `buk-resources/${fileName}`

    // Use Server-Side Secret Token
    const hfToken = process.env.HF_TOKEN
    const hfDataset = process.env.NEXT_PUBLIC_HF_DATASET

    if (!hfToken || !hfDataset) {
      console.error(`[${requestId}] Missing HF Configuration: token=${!!hfToken}, dataset=${hfDataset}`)
      return NextResponse.json({
        error: 'Server configuration error: Hugging Face credentials missing',
        details: 'Ask admin to set HF_TOKEN and NEXT_PUBLIC_HF_DATASET environment variables.'
      }, { status: 500 })
    }

    // Convert file to base64 for HF Commit API
    let base64Content: string
    try {
      const bytes = await file.arrayBuffer()
      base64Content = Buffer.from(bytes).toString('base64')
      console.log(`[${requestId}] File converted to base64 successfully`)
    } catch (bufferError: any) {
      console.error(`[${requestId}] Buffer conversion error:`, bufferError)
      return NextResponse.json({ error: 'Failed to process file content' }, { status: 500 })
    }

    // Upload to Hugging Face via Commit API
    console.log(`[${requestId}] Sending commit to HF dataset: ${hfDataset}`)
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

    const hfData = await hfResponse.json().catch(() => ({ message: 'Could not parse HF response' }))

    if (!hfResponse.ok) {
      console.error(`[${requestId}] HF Commit API Error (${hfResponse.status}):`, hfData)

      // Provide more specific error messages based on HF response
      let errorMessage = 'Hugging Face upload failed'
      if (hfResponse.status === 401) errorMessage = 'Hugging Face authentication failed (Invalid HF_TOKEN)'
      if (hfResponse.status === 404) errorMessage = 'Hugging Face dataset not found'
      if (hfResponse.status === 413) errorMessage = 'File too large for Hugging Face API'

      return NextResponse.json({
        error: errorMessage,
        debug: hfData,
        status: hfResponse.status
      }, { status: 502 })
    }

    console.log(`[${requestId}] HF Commit successful. New file path: ${filePath}`)

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
      console.error(`[${requestId}] Supabase DB Error:`, dbError)
      // Cleanup HF if DB fails to prevent orphaned files
      console.log(`[${requestId}] Cleaning up orphaned HF file...`)
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
      ).catch((cleanupErr) => console.error(`[${requestId}] Failed to cleanup orphaned HF file:`, cleanupErr))

      return NextResponse.json({
        error: 'Resource uploaded but metadata storage failed',
        details: dbError.message
      }, { status: 500 })
    }

    console.log(`[${requestId}] Resource upload and metadata storage complete`)
    return NextResponse.json({ success: true, resource, hf_debug: hfData })
  } catch (error: any) {
    console.error(`[${requestId}] Global Resource Upload API Error:`, error)
    return NextResponse.json({
      error: 'An unexpected error occurred during upload',
      details: error.message
    }, { status: 500 })
  }
}
