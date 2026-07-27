import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a helpful AI assistant. Answer any question thoroughly and accurately. Use markdown formatting.`

export async function POST(request: NextRequest) {
  let body: any

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { messages } = body
  const userMessage = messages?.[messages.length - 1]?.content || ''

  const geminiKey = process.env.GEMINI_API_KEY

  if (!geminiKey) {
    return NextResponse.json({
      response: `API Key not found. Add GEMINI_API_KEY to .env.local`,
      isDemo: true,
    })
  }

  // Try multiple models in order
  const models = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-pro',
    'gemini-1.0-pro',
  ]

  for (const modelName of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      })

      const data = await response.json()

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return NextResponse.json({
          response: data.candidates[0].content.parts[0].text,
          isDemo: false,
          model: modelName,
        })
      }

      // If blocked or no response, try next model
      if (data.error) {
        console.log(`Model ${modelName} failed:`, data.error.message)
        continue
      }

    } catch (e) {
      console.log(`Model ${modelName} error:`, e)
      continue
    }
  }

  // All models failed - return helpful error
  return NextResponse.json({
    response: `## Unable to connect to AI

Your API key may be invalid or have no quota.

**Get a valid API key:**
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API key"
4. Copy the key (starts with \`AIza...\`)
5. Add to \`.env.local\`: \`GEMINI_API_KEY=AIza...\`
6. Restart dev server

**Your question:** "${userMessage}"`,
    isDemo: true,
  })
}
