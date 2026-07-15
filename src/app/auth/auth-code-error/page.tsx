import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black mb-4">Authentication Error</h1>
      <p className="text-zinc-500 mb-8">We couldn't verify your secure code. This usually happens if the link has expired.</p>
      <Link href="/login" className="px-8 py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest">
        Return to Login
      </Link>
    </div>
  )
}
