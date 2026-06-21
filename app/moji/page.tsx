'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser, addStars } from '@/lib/store';
import BackButton from '@/components/BackButton';
import StarCounter from '@/components/StarCounter';

// ひらがな五十音・濁点・半濁点・拗音・小文字
const HIRAGANA = [
  'あ','い','う','え','お',
  'か','き','く','け','こ',
  'さ','し','す','せ','そ',
  'た','ち','つ','て','と',
  'な','に','ぬ','ね','の',
  'は','ひ','ふ','へ','ほ',
  'ま','み','む','め','も',
  'や','　','ゆ','　','よ',
  'ら','り','る','れ','ろ',
  'わ','　','　','　','を',
  'ん',
  'が','ぎ','ぐ','げ','ご',
  'ざ','じ','ず','ぜ','ぞ',
  'だ','ぢ','づ','で','ど',
  'ば','び','ぶ','べ','ぼ',
  'ぱ','ぴ','ぷ','ぺ','ぽ',
  'きゃ','きゅ','きょ',
  'しゃ','しゅ','しょ',
  'ちゃ','ちゅ','ちょ',
  'にゃ','にゅ','にょ',
  'ひゃ','ひゅ','ひょ',
  'みゃ','みゅ','みょ',
  'りゃ','りゅ','りょ',
  'ぁ','ぃ','ぅ','ぇ','ぉ','っ','ゃ','ゅ','ょ',
];

const KATAKANA = HIRAGANA.map(c => {
  if (c === '　') return '　';
  const code = c.codePointAt(0);
  if (code === undefined) return c;
  // ひらがな範囲 U+3041-U+3096 → カタカナ U+30A1-U+30F6 (+0x60)
  if (code >= 0x3041 && code <= 0x3096) {
    return String.fromCodePoint(code + 0x60);
  }
  return c;
});

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ABC_READING: Record<string, string> = {
  A: 'えー', B: 'びー', C: 'しー', D: 'でぃー', E: 'いー',
  F: 'えふ', G: 'じー', H: 'えいち', I: 'あい', J: 'じぇー',
  K: 'けー', L: 'える', M: 'えむ', N: 'えぬ', O: 'おー',
  P: 'ぴー', Q: 'きゅー', R: 'あーる', S: 'えす', T: 'てぃー',
  U: 'ゆー', V: 'ぶい', W: 'だぶりゅー', X: 'えっくす', Y: 'わい', Z: 'ぜっと',
};

const BUTTON_COLORS = [
  '#FFB7C5', '#98E4D6', '#C8B8E8', '#FFE66D', '#87CEEB', '#FFB347', '#B8E6F8',
];

type Tab = 'hiragana' | 'katakana' | 'abc';

function speak(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.8;
  synth.speak(utter);
}

export default function MojiPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('hiragana');
  const [selected, setSelected] = useState('あ');
  const [showSparkle, setShowSparkle] = useState(false);
  const [punittoKey, setPunittoKey] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizTarget, setQuizTarget] = useState('');
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const user = loadUser();
    if (user) setStars(user.stars);
  }, []);

  const currentChars = tab === 'hiragana' ? HIRAGANA : tab === 'katakana' ? KATAKANA : ABC;
  const filteredChars = currentChars.filter(c => c !== '　');

  const handleCharClick = useCallback((char: string) => {
    if (char.trim() === '') return;

    setPunittoKey(char);
    setTimeout(() => setPunittoKey(null), 300);

    setSelected(char);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1000);

    // 読み上げ
    const readText = tab === 'abc' ? (ABC_READING[char] ?? char) : char;
    speak(readText);

    // クイズモード時の判定
    if (quizMode && quizTarget) {
      if (char === quizTarget) {
        setQuizResult('correct');
        setShowConfetti(true);
        const user = addStars(3);
        if (user) setStars(user.stars);
        setTimeout(() => {
          setShowConfetti(false);
          setQuizResult(null);
          startNewQuiz();
        }, 2000);
      } else {
        setQuizResult('wrong');
        setTimeout(() => setQuizResult(null), 1000);
      }
    }
  }, [tab, quizMode, quizTarget]);

  const startNewQuiz = useCallback(() => {
    const chars = (tab === 'hiragana' ? HIRAGANA : tab === 'katakana' ? KATAKANA : ABC)
      .filter(c => c.trim() !== '');
    const target = chars[Math.floor(Math.random() * chars.length)];
    setQuizTarget(target);
    const readText = tab === 'abc' ? (ABC_READING[target] ?? target) : target;
    speak(`${readText} をおしてね！`);
  }, [tab]);

  const toggleQuiz = useCallback(() => {
    if (!quizMode) {
      setQuizMode(true);
      setQuizResult(null);
      setTimeout(() => startNewQuiz(), 100);
    } else {
      setQuizMode(false);
      setQuizTarget('');
      setQuizResult(null);
    }
  }, [quizMode, startNewQuiz]);

  // タブ切り替え時にクイズリセット
  useEffect(() => {
    setQuizMode(false);
    setQuizTarget('');
    setQuizResult(null);
    setSelected(tab === 'abc' ? 'A' : tab === 'hiragana' ? 'あ' : 'ア');
  }, [tab]);

  const confettiItems = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: BUTTON_COLORS[i % BUTTON_COLORS.length],
    size: 8 + Math.random() * 8,
  }));

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFB7C5 0%, #FFE0E8 100%)' }}
    >
      {/* 紙吹雪 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiItems.map(c => (
            <div
              key={c.id}
              className="absolute rounded-full animate-confetti"
              style={{
                left: `${c.x}%`,
                top: '-20px',
                width: c.size,
                height: c.size,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 relative z-10">
        <BackButton href="/" />
        <StarCounter stars={stars} />
      </div>

      {/* 選択文字の大表示 */}
      <div className="flex items-center justify-center py-4 relative z-10">
        <div
          className="relative flex items-center justify-center rounded-3xl shadow-lg"
          style={{
            width: 120,
            height: 120,
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <span
            className={`text-7xl font-bold select-none transition-all ${showSparkle ? 'scale-110' : 'scale-100'}`}
            style={{ color: '#4A4A4A', transition: 'transform 0.3s ease' }}
          >
            {selected.trim() || 'あ'}
          </span>
          {showSparkle && (
            <>
              <span className="absolute top-1 right-1 text-xl animate-sparkle">✨</span>
              <span className="absolute bottom-2 left-2 text-lg animate-sparkle" style={{ animationDelay: '0.2s' }}>⭐</span>
              <span className="absolute top-2 left-4 text-sm animate-sparkle" style={{ animationDelay: '0.4s' }}>✨</span>
            </>
          )}
        </div>
      </div>

      {/* クイズ吹き出し */}
      {quizMode && (
        <div
          className="mx-4 rounded-3xl px-4 py-3 text-center mb-2 relative z-10"
          style={{
            backgroundColor: quizResult === 'correct' ? '#98E4D6' : quizResult === 'wrong' ? '#FFB7C5' : '#FFE66D',
            border: '2px solid rgba(255,255,255,0.7)',
          }}
        >
          <p className="font-bold text-lg" style={{ color: '#4A4A4A' }}>
            {quizResult === 'correct'
              ? '🎉 せいかい！ほし+3'
              : quizResult === 'wrong'
              ? 'もういちど！'
              : `「${quizTarget}」をおしてね！`}
          </p>
        </div>
      )}

      {/* タブ切り替え */}
      <div className="flex mx-4 gap-2 mb-3 relative z-10">
        {(['hiragana', 'katakana', 'abc'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-full py-2 font-bold text-sm transition-all"
            style={{
              backgroundColor: tab === t ? '#4A4A4A' : 'rgba(255,255,255,0.8)',
              color: tab === t ? 'white' : '#4A4A4A',
              border: '2px solid rgba(255,255,255,0.6)',
              minHeight: '44px',
              transform: tab === t ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {t === 'hiragana' ? 'ひらがな' : t === 'katakana' ? 'カタカナ' : 'ABC'}
          </button>
        ))}
      </div>

      {/* 文字ボタングリッド */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 relative z-10">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {filteredChars.map((char, i) => (
            <button
              key={`${tab}-${i}`}
              onClick={() => handleCharClick(char)}
              className="rounded-full font-bold text-xl transition-all active:scale-90 flex items-center justify-center shadow-md"
              style={{
                backgroundColor: BUTTON_COLORS[i % BUTTON_COLORS.length],
                minHeight: '56px',
                color: '#4A4A4A',
                border: quizMode && char === quizTarget ? '3px solid #4A4A4A' : '2px solid rgba(255,255,255,0.7)',
                animation: punittoKey === char ? 'punitto 0.3s ease-in-out' : undefined,
                fontSize: char.length > 1 ? '0.8rem' : '1.4rem',
              }}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* クイズボタン（固定下部） */}
      <div className="fixed bottom-4 left-4 right-4 z-20">
        <button
          onClick={toggleQuiz}
          className="w-full rounded-full py-4 text-xl font-bold shadow-lg transition-all active:scale-95"
          style={{
            background: quizMode
              ? 'linear-gradient(135deg, #98E4D6, #5CC8B8)'
              : 'linear-gradient(135deg, #C8B8E8, #A090D0)',
            color: 'white',
            minHeight: '60px',
            boxShadow: quizMode ? '0 6px 20px rgba(92,200,184,0.5)' : '0 6px 20px rgba(160,144,208,0.5)',
          }}
        >
          {quizMode ? '🎓 クイズをやめる' : '🎓 クイズする'}
        </button>
      </div>
    </div>
  );
}
