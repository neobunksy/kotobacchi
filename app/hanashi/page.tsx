'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AiBuddy, { type AiBuddyMood } from '@/components/AiBuddy';
import BackButton from '@/components/BackButton';
import { speak } from '@/lib/speak';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
};

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'ai',
  text: 'こんにちは！なにかはなしかけてね！',
};

// ===== かなデータ =====
const HIRAGANA_MAIN: (string | null)[] = [
  'あ','い','う','え','お',
  'か','き','く','け','こ',
  'さ','し','す','せ','そ',
  'た','ち','つ','て','と',
  'な','に','ぬ','ね','の',
  'は','ひ','ふ','へ','ほ',
  'ま','み','む','め','も',
  'や', null,'ゆ', null,'よ',
  'ら','り','る','れ','ろ',
  'わ', null, null, null,'を',
  'ん', null, null, null, null,
];

const DAKUTEN_MAIN: (string | null)[] = [
  'が','ぎ','ぐ','げ','ご',
  'ざ','じ','ず','ぜ','ぞ',
  'だ','ぢ','づ','で','ど',
  'ば','び','ぶ','べ','ぼ',
  'ぱ','ぴ','ぷ','ぺ','ぽ',
];

const SMALL_CHARS: string[] = [
  'ぁ','ぃ','ぅ','ぇ','ぉ',
  'ゃ','ゅ','ょ','っ','ー',
];

const YOON_CHARS: string[] = [
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

const BUTTON_COLORS = [
  '#FFB7C5', '#98E4D6', '#C8B8E8', '#FFE66D', '#87CEEB', '#FFB347', '#B8E6F8',
];

type KanaTab = 'hiragana' | 'dakuten' | 'komoji';

// 縦書きグリッド
function VerticalGrid({
  cells,
  onCharTap,
}: {
  cells: (string | null)[];
  onCharTap: (char: string) => void;
}) {
  let colorIdx = 0;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'repeat(5, 48px)',
        gridAutoFlow: 'column',
        direction: 'rtl',
        gap: '4px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {cells.map((char, i) => {
        if (char === null) {
          return <div key={i} style={{ width: 48 }} />;
        }
        const ci = colorIdx++;
        return (
          <button
            key={i}
            onClick={() => onCharTap(char)}
            className="rounded-full font-bold transition-all active:scale-90 flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: BUTTON_COLORS[ci % BUTTON_COLORS.length],
              width: 48,
              height: 48,
              color: '#4A4A4A',
              border: '2px solid rgba(255,255,255,0.7)',
              fontSize: char.length > 1 ? '0.75rem' : '1.2rem',
              flexShrink: 0,
            }}
          >
            {char}
          </button>
        );
      })}
    </div>
  );
}


export default function HanashiPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [kanaTab, setKanaTab] = useState<KanaTab>('hiragana');
  const [aiMood, setAiMood] = useState<AiBuddyMood>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const talkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // アンマウント時にタイマークリーンアップ
  useEffect(() => {
    return () => {
      if (talkingTimerRef.current) clearTimeout(talkingTimerRef.current);
    };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const trimmedText = text.trim();

    // 会話履歴を構築（初期メッセージを除外し、必ず user から始まる）
    const history = messages
      .filter(m => m.id !== 'init')
      .map(m => ({
        role: m.role === 'ai' ? ('model' as const) : ('user' as const),
        text: m.text,
      }));

    // UI 更新（setMessages の外で副作用を起こす）
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmedText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setAiMood('thinking');
    if (talkingTimerRef.current) clearTimeout(talkingTimerRef.current);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedText, history }),
      });
      const data = (await res.json()) as { reply: string };
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'ai', text: data.reply };
      setMessages(prev => [...prev, aiMsg]);
      speak(data.reply);
      setAiMood('talking');
      talkingTimerRef.current = setTimeout(() => setAiMood('idle'), 3000);
    } catch {
      const errMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'ai',
        text: 'ごめんね、うまくきこえなかった！もういちどいってね！',
      };
      setMessages(prev => [...prev, errMsg]);
      setAiMood('idle');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert('このブラウザはマイクをつかえないよ。もじをうってね！');
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInputText(transcript);
        sendMessage(transcript);
      }
    };

    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleKanaTap = useCallback((char: string) => {
    setInputText(prev => prev + char);
  }, []);

  const handleDelete = useCallback(() => {
    setInputText(prev => {
      // サロゲートペアや複数文字を考慮して末尾1文字削除
      return [...prev].slice(0, -1).join('');
    });
  }, []);

  return (
    <div
      className="flex flex-col h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #C8B8E8 0%, #E8E0F5 100%)' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center px-4 pt-6 pb-2 relative z-10 flex-shrink-0">
        <BackButton href="/" />
        <h1 className="ml-4 text-xl font-bold" style={{ color: '#4A4A4A' }}>おはなし</h1>
      </div>

      {/* AIキャラクター（小さめ） */}
      <div className="flex justify-center py-1 relative z-10 flex-shrink-0">
        <AiBuddy size={64} mood={aiMood} />
      </div>

      {/* 会話ログ（flex-1でスクロール可能） */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 relative z-10 min-h-0">
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="rounded-3xl px-4 py-3 max-w-[75%] shadow-md"
                style={{
                  backgroundColor: msg.role === 'user' ? '#FFB7C5' : 'rgba(255,255,255,0.9)',
                  color: '#4A4A4A',
                  borderRadius: msg.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                }}
              >
                <p className="text-base font-medium leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-3xl px-5 py-3 shadow-md" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '24px 24px 24px 6px' }}>
                <div className="flex gap-1 items-center">
                  <span style={{ color: '#888' }} className="text-sm">かんがえちゅう...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力バー */}
      <div
        className="px-4 pt-2 pb-1 relative z-10 flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderTop: '2px solid rgba(200,184,232,0.4)' }}
      >
        <div className="flex gap-2 items-center max-w-sm mx-auto">
          {/* 入力テキスト表示 */}
          <div
            className="flex-1 rounded-2xl px-3 py-2 font-bold overflow-hidden"
            style={{
              border: '2px solid',
              borderColor: inputText ? '#C8B8E8' : '#E0E0E0',
              color: '#4A4A4A',
              backgroundColor: 'white',
              minHeight: '44px',
              fontSize: '1rem',
              wordBreak: 'break-all',
            }}
          >
            {inputText || <span style={{ color: '#ccc' }}>ここにかいてね</span>}
          </div>

          {/* 削除ボタン */}
          <button
            onClick={handleDelete}
            disabled={!inputText}
            className="rounded-full shadow transition-all active:scale-90 flex items-center justify-center"
            style={{
              backgroundColor: inputText ? '#FFB347' : '#E0E0E0',
              minWidth: '44px',
              minHeight: '44px',
              border: '2px solid rgba(255,255,255,0.8)',
              fontSize: '1.2rem',
            }}
            aria-label="さいごのもじをけす"
          >
            ←
          </button>

          {/* マイクボタン */}
          <button
            onClick={isListening ? stopListening : startListening}
            className="rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center"
            style={{
              backgroundColor: isListening ? '#FF6B6B' : '#C8B8E8',
              minWidth: '44px',
              minHeight: '44px',
              border: '2px solid rgba(255,255,255,0.8)',
              animation: isListening ? 'gentlePulse 1s ease-in-out infinite' : undefined,
            }}
            aria-label={isListening ? 'マイクをとめる' : 'マイクをつかう'}
          >
            <span className="text-xl">{isListening ? '⏹' : '🎤'}</span>
          </button>

          {/* 送信ボタン */}
          <button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center"
            style={{
              backgroundColor: inputText.trim() && !isLoading ? '#FFB7C5' : '#E0E0E0',
              minWidth: '44px',
              minHeight: '44px',
              border: '2px solid rgba(255,255,255,0.8)',
            }}
            aria-label="おくる"
          >
            <span className="text-xl">➤</span>
          </button>
        </div>
      </div>

      {/* キーボード切替タブ */}
      <div
        className="flex px-4 gap-1 py-1 flex-shrink-0 relative z-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
      >
        {(['hiragana', 'dakuten', 'komoji'] as KanaTab[]).map(t => (
          <button
            key={t}
            onClick={() => setKanaTab(t)}
            className="flex-1 rounded-full py-1 font-bold text-xs transition-all"
            style={{
              backgroundColor: kanaTab === t ? '#C8B8E8' : 'rgba(240,236,250,0.8)',
              color: '#4A4A4A',
              border: '1px solid rgba(200,184,232,0.5)',
              minHeight: '32px',
            }}
          >
            {t === 'hiragana' ? 'ひらがな' : t === 'dakuten' ? 'だくてん' : 'こもじ'}
          </button>
        ))}
      </div>

      {/* かなキーボードエリア（高さ固定） */}
      <div
        className="flex-shrink-0 px-3 py-2 relative z-10 overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTop: '1px solid rgba(200,184,232,0.3)',
          height: '180px',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {kanaTab === 'hiragana' && (
          <VerticalGrid cells={HIRAGANA_MAIN} onCharTap={handleKanaTap} />
        )}
        {kanaTab === 'dakuten' && (
          <VerticalGrid cells={DAKUTEN_MAIN} onCharTap={handleKanaTap} />
        )}
        {kanaTab === 'komoji' && (
          <div className="flex flex-col gap-2">
            {/* SMALL_CHARS: 5列 */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(5, 48px)' }}
            >
              {SMALL_CHARS.map((char, i) => (
                <button
                  key={`small-${i}`}
                  onClick={() => handleKanaTap(char)}
                  className="rounded-full font-bold transition-all active:scale-90 flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: BUTTON_COLORS[i % BUTTON_COLORS.length],
                    width: 48,
                    height: 48,
                    color: '#4A4A4A',
                    border: '2px solid rgba(255,255,255,0.7)',
                    fontSize: '1.2rem',
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
            {/* YOON_CHARS: 5列 */}
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(5, 48px)', overflowX: 'auto' }}
            >
              {YOON_CHARS.map((char, i) => (
                <button
                  key={`yoon-${i}`}
                  onClick={() => handleKanaTap(char)}
                  className="rounded-full font-bold transition-all active:scale-90 flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: BUTTON_COLORS[(i + 2) % BUTTON_COLORS.length],
                    width: 48,
                    height: 48,
                    color: '#4A4A4A',
                    border: '2px solid rgba(255,255,255,0.7)',
                    fontSize: '0.75rem',
                  }}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
