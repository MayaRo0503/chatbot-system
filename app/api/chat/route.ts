import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, starterMessage, gender } = await request.json()

    if (!systemPrompt) {
      return NextResponse.json({ error: "Missing system prompt" }, { status: 400 })
    }

    // אם זו הודעת התחלה
    if (starterMessage && !messages?.length) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: starterMessage,
          },
        ],
      })

      return NextResponse.json({ reply: text })
    }

    // הודעות רגילות
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing or invalid messages" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: messages,
    })

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "שגיאה בשרת, נסה שוב מאוחר יותר" }, { status: 500 })
  }
}
