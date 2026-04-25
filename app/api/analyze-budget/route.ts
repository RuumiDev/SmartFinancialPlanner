import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error("[analyze-budget] GEMINI_API_KEY is not set in environment variables.")
    return NextResponse.json(
      { suggestion: null, error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    )
  }

  let body: {
    income: number
    needs: Record<string, unknown>
    wants: Record<string, unknown>
    savings: Record<string, unknown>
    unallocated: number
  }

  try {
    body = await req.json()
  } catch (err) {
    console.error("[analyze-budget] Failed to parse request body:", err)
    return NextResponse.json({ suggestion: null, error: "Invalid JSON body." }, { status: 400 })
  }

  const { income, needs, wants, savings, unallocated } = body

  if (
    typeof income !== "number" ||
    typeof unallocated !== "number" ||
    !needs ||
    !wants ||
    !savings
  ) {
    console.error("[analyze-budget] Missing or invalid fields:", { income, unallocated, needs: !!needs, wants: !!wants, savings: !!savings })
    return NextResponse.json(
      { suggestion: null, error: "Missing or invalid fields." },
      { status: 400 }
    )
  }

  const isOverspending = unallocated < 0
  const absAmount = Math.abs(unallocated).toFixed(2)

  const prompt =
    `You are a strategic financial advisor.\n` +
    `User's data: Needs: ${JSON.stringify(needs)}, Wants: ${JSON.stringify(wants)}, Savings: ${JSON.stringify(savings)}.\n` +
    `Leftover/Overspent: RM ${absAmount} ${isOverspending ? "OVER BUDGET" : "UNALLOCATED"}.\n\n` +
    `Provide exactly 3 distinct, actionable options for handling this exact amount based on their data.\n` +
    `RULES:\n` +
    `1. Do not write an intro or outro paragraph. Start immediately with '1. '\n` +
    `2. Make each point a single, concise sentence.\n` +
    `3. If UNALLOCATED, suggest different vehicles (e.g., Option 1 for a specific Debt/Need, Option 2 for a specific Investment/Saving, Option 3 for an emergency fund or want).\n` +
    `4. If OVER BUDGET, suggest 3 specific, different line items they currently spend heavily on that they should cut back.\n` +
    `5. Separate each numbered point with a double newline (\n\n). Do not write them all on one line.\n` +
    `6. Format strictly as a numbered list:\n` +
    `1. [Option]\n\n` +
    `2. [Option]\n\n` +
    `3. [Option]`

  console.log(`[analyze-budget] Sending prompt to Gemini. isOverspending=${isOverspending}, unallocated=${unallocated}`)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048, // Massively increased to accommodate reasoning tokens
        temperature: 0.4,
      },
    })

    const responseText = result.response.text().trim()
    if (!responseText) {
      console.error("[analyze-budget] Gemini returned an empty response.")
      return NextResponse.json(
        { suggestion: null, error: "AI returned an empty response." },
        { status: 502 }
      )
    }

    console.log("[analyze-budget] Gemini responded successfully:", responseText)
    return NextResponse.json({ suggestion: responseText })
  } catch (err) {
    console.error("[GEMINI_ERROR]:", err)
    const message = err instanceof Error ? err.message : "Unknown API error"
    return NextResponse.json(
      { suggestion: null, error: message },
      { status: 502 }
    )
  }
}
