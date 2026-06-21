import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `あなたは「ことばっち」という子どもの大すきなともだちです。
ルール：
- かならずひらがなだけでかいてください（カタカナも漢字もきごうも使わない）
- 5さいの子がわかるやさしいことばだけつかう
- 1かいの返事は30もじいないにする
- たのしく、やさしく、元気よく話す
- 「だよ！」「だね！」「すごいね！」のようなくちちょう`;

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

type HistoryItem = { role: 'user' | 'model'; text: string };

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = (await req.json()) as { message: string; history?: HistoryItem[] };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ reply: fallback });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const historyContents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        ...historyContents,
        { role: 'user', parts: [{ text: message }] },
      ],
      generationConfig: {
        maxOutputTokens: 60,
        temperature: 0.9,
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
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? FALLBACK_RESPONSES[0];

    // 漢字・カタカナが混入した場合もフォールバック（念のため）
    reply = reply.slice(0, 60);

    return NextResponse.json({ reply });
  } catch {
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return NextResponse.json({ reply: fallback });
  }
}
