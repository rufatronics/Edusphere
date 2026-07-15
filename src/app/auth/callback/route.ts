import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Dynamic origin detection for production vs development
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // If we are in development, always redirect to localhost
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // In production, trust the request origin unless specified otherwise
      // This prevents the "localhost" redirect issue on deployed sites
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Redirect to error page if exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
