import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, context } = await req.json()

    let systemPrompt = "You are EduSphere AI, a helpful academic tutor for BUK students. "

    if (context) {
      systemPrompt += `You have access to the following document content: """${context}""". Use this to answer the user's questions. `
    }

    if (mode === 'socratic') systemPrompt += "Use the Socratic method: don't give direct answers. Ask guiding questions. "
    else if (mode === 'simplify') systemPrompt += "Explain like I'm 5. "

    const response = await fetch('https://maganaaiproxy.onrender.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      }),
    })

    if (response.status === 429) {
      return NextResponse.json({
        error: 'Too Many Requests',
        message: 'Please wait a few seconds (5s interval) before asking again.'
      }, { status: 429 })
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('AI Proxy Error:', errorData)
      return NextResponse.json({ error: 'AI Proxy failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data.choices[0].message)

  } catch (error: any) {
    console.error('Global AI API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
