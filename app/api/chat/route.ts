import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `あなたは子供のおともだちです。ひらがなとカタカナのみで話してください。漢字は禁止。最大50文字。やさしく短く話してください。`;

const FALLBACK_RESPONSES = [
  'そうなんだね！',
  'たのしいね！',
  'すごいね！',
  'いいね！',
  'わかった！',
  'そうそう！',
  'やってみよう！',
  'えらいね！',
  'いっしょにやろう！',
  'おもしろいね！',
];

export async function POST(req: NextRequest) {
  try {
    const { message } = (await req.json()) as { message: string };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // フォールバック
      const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ reply: fallback });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 80,
        temperature: 0.8,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ reply: fallback });
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? FALLBACK_RESPONSES[0];

    return NextResponse.json({ reply });
  } catch {
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return NextResponse.json({ reply: fallback });
  }
}
