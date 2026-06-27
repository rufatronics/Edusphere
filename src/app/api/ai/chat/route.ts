import { NextRequest, NextResponse } from 'next/server'

async function callGroq(messages: any[], systemPrompt: string) {
  // Using llama-3.3-70b-versatile as requested (avoiding 8b)
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
    }),
  })
  if (!response.ok) throw new Error('Groq failed')
  return response.json()
}

async function callGemini(messages: any[], systemPrompt: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
      system_instruction: { parts: [{ text: systemPrompt }] }
    }),
  })
  if (!response.ok) throw new Error('Gemini failed')
  const data = await response.json()
  return { choices: [{ message: { role: 'assistant', content: data.candidates[0].content.parts[0].text } }] }
}

export async function POST(req: NextRequest) {
  const { messages, mode } = await req.json()

  let systemPrompt = "You are EduSphere AI, a helpful academic tutor for students at Bayero University, Kano (BUK). "
  if (mode === 'socratic') systemPrompt += "Use the Socratic method: don't give direct answers. Ask guiding questions. "
  else if (mode === 'simplify') systemPrompt += "Explain like I'm 5. "

  try {
    try {
      const data = await callGroq(messages, systemPrompt)
      return NextResponse.json(data.choices[0].message)
    } catch (e) {
      console.warn('Groq failed, falling back to Gemini')
      const data = await callGemini(messages, systemPrompt)
      return NextResponse.json(data.choices[0].message)
    }
  } catch (error) {
    return NextResponse.json({ error: 'All AI models failed' }, { status: 500 })
  }
}
