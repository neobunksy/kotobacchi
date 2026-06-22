/**
 * 音声ファイル生成スクリプト
 *
 * 使い方（PowerShell）:
 *   $env:GEMINI_API_KEY = "your_api_key_here"
 *   node scripts/generate-audio.mjs
 *
 * 生成された音声ファイルは public/audio/ に保存されます。
 * ファイル名は読み上げテキストそのまま（例: あ.wav、えー.wav）。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.log('APIキーが見つかりません（GEMINI_API_KEY or GOOGLE_API_KEY）。');
  console.log('PowerShell で以下を実行してから再試行してください:');
  console.log('  $env:GEMINI_API_KEY = "your_api_key_here"');
  console.log('Web Speech API フォールバックのみ実装します。');
  process.exit(0);
}

// public/audio/ ディレクトリ作成
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`ディレクトリ作成: ${OUTPUT_DIR}`);
}

// ============================================================
// 生成対象文字リスト
// ============================================================

// 五十音（nullを除く）
const HIRAGANA_MAIN = [
  'あ','い','う','え','お',
  'か','き','く','け','こ',
  'さ','し','す','せ','そ',
  'た','ち','つ','て','と',
  'な','に','ぬ','ね','の',
  'は','ひ','ふ','へ','ほ',
  'ま','み','む','め','も',
  'や','ゆ','よ',
  'ら','り','る','れ','ろ',
  'わ','を','ん',
];

// 濁音・半濁音
const DAKUTEN_MAIN = [
  'が','ぎ','ぐ','げ','ご',
  'ざ','じ','ず','ぜ','ぞ',
  'だ','ぢ','づ','で','ど',
  'ば','び','ぶ','べ','ぼ',
  'ぱ','ぴ','ぷ','ぺ','ぽ',
];

// 小文字・長音
const SMALL_CHARS = [
  'ぁ','ぃ','ぅ','ぇ','ぉ',
  'ゃ','ゅ','ょ','っ','ー',
];

// 拗音
const YOON_CHARS = [
  'きゃ','きゅ','きょ',
  'しゃ','しゅ','しょ',
  'ちゃ','ちゅ','ちょ',
  'にゃ','にゅ','にょ',
  'ひゃ','ひゅ','ひょ',
  'みゃ','みゅ','みょ',
  'りゃ','りゅ','りょ',
  'ぎゃ','ぎゅ','ぎょ',
  'じゃ','じゅ','じょ',
  'びゃ','びゅ','びょ',
  'ぴゃ','ぴゅ','ぴょ',
];

// ABC読み方（ファイル名 = 読み方テキスト）
// speak.ts は読み方テキストでファイルを探すため、ファイル名も読み方にする
const ABC_READINGS = [
  'えー',   // A
  'びー',   // B
  'しー',   // C
  'でぃー', // D
  'いー',   // E
  'えふ',   // F
  'じー',   // G
  'えいち', // H
  'あい',   // I
  'じぇー', // J
  'けー',   // K
  'える',   // L
  'えむ',   // M
  'えぬ',   // N
  'おー',   // O
  'ぴー',   // P
  'きゅー', // Q
  'あーる', // R
  'えす',   // S
  'てぃー', // T
  'ゆー',   // U
  'ぶい',   // V
  'だぶりゅー', // W
  'えっくす',   // X
  'わい',   // Y
  'ぜっと', // Z
];

// 全文字リスト（テキスト, ファイル名）
const ALL_ENTRIES = [
  ...HIRAGANA_MAIN.map(c => ({ text: c, filename: c })),
  ...DAKUTEN_MAIN.map(c => ({ text: c, filename: c })),
  ...SMALL_CHARS.map(c => ({ text: c, filename: c })),
  ...YOON_CHARS.map(c => ({ text: c, filename: c })),
  ...ABC_READINGS.map(r => ({ text: r, filename: r })),
];

console.log(`生成対象: ${ALL_ENTRIES.length} 件`);

// ============================================================
// Gemini TTS API を使った音声生成
// ============================================================

async function generateWithGeminiTTS(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini TTS エラー (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) {
    throw new Error(`Gemini TTS: 音声データなし (${JSON.stringify(data).slice(0, 200)})`);
  }

  return {
    data: Buffer.from(part.inlineData.data, 'base64'),
    ext: part.inlineData.mimeType?.includes('mp3') ? 'mp3' : 'wav',
  };
}

// ============================================================
// Google Text-to-Speech REST API（フォールバック）
// ============================================================

async function generateWithGoogleTTS(text) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
  const body = {
    input: { text },
    voice: { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-B' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google TTS エラー (${res.status}): ${errText}`);
  }

  const data = await res.json();
  if (!data.audioContent) {
    throw new Error(`Google TTS: audioContent なし`);
  }

  return {
    data: Buffer.from(data.audioContent, 'base64'),
    ext: 'mp3',
  };
}

// ============================================================
// メイン処理
// ============================================================

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { text, filename } of ALL_ENTRIES) {
    // すでにwav/mp3が存在する場合はスキップ
    const wavPath = path.join(OUTPUT_DIR, `${filename}.wav`);
    const mp3Path = path.join(OUTPUT_DIR, `${filename}.mp3`);
    if (fs.existsSync(wavPath) || fs.existsSync(mp3Path)) {
      console.log(`スキップ（既存）: ${filename}`);
      skipCount++;
      continue;
    }

    try {
      let result;
      try {
        // まず Gemini TTS を試す
        result = await generateWithGeminiTTS(text);
      } catch (geminiErr) {
        console.warn(`  Gemini TTS 失敗: ${geminiErr.message.slice(0, 100)}`);
        console.log(`  Google TTS へフォールバック...`);
        result = await generateWithGoogleTTS(text);
      }

      const outputPath = path.join(OUTPUT_DIR, `${filename}.${result.ext}`);
      fs.writeFileSync(outputPath, result.data);
      console.log(`生成完了: ${filename}.${result.ext} (${result.data.length} bytes)`);
      successCount++;
    } catch (err) {
      console.error(`エラー: ${filename} → ${err.message.slice(0, 150)}`);
      errorCount++;
    }

    // レート制限対応: 100ms 待機
    await sleep(100);
  }

  console.log('\n============================');
  console.log(`完了: 成功=${successCount}, スキップ=${skipCount}, エラー=${errorCount}`);
  console.log(`出力先: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
