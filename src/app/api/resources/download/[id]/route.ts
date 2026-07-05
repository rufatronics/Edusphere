import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    // 1. Get the file URL and current count
    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('file_url, downloads_count')
      .eq('id', id)
      .single()

    if (fetchError || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // 2. Increment download count (background - don't block the redirect)
    supabase
      .from('resources')
      .update({ downloads_count: (resource.downloads_count || 0) + 1 })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Failed to increment download count:', error)
      })

    // 3. Redirect to the Hugging Face resolve URL
    return NextResponse.redirect(resource.file_url)
  } catch (error: any) {
    console.error('Resource Download API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
