'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser, addStars } from '@/lib/store';
import BackButton from '@/components/BackButton';
import StarCounter from '@/components/StarCounter';
import { speak } from '@/lib/speak';

// 五十音（縦書きグリッド用: 列優先、null = 空セル）
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

// 小文字・長音（横並び）
const SMALL_CHARS: string[] = [
  'ぁ','ぃ','ぅ','ぇ','ぉ',
  'ゃ','ゅ','ょ','っ','ー',
];

// 拗音（横並び、3列）
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

// カタカナ変換（ひらがなコードポイント+0x60）
function toKatakana(char: string | null): string | null {
  if (char === null) return null;
  const code = char.codePointAt(0);
  if (code === undefined) return char;
  if (code >= 0x3041 && code <= 0x3096) {
    return String.fromCodePoint(code + 0x60);
  }
  // 拗音・複数文字の変換
  return char.split('').map(c => {
    const cp = c.codePointAt(0);
    if (cp !== undefined && cp >= 0x3041 && cp <= 0x3096) {
      return String.fromCodePoint(cp + 0x60);
    }
    return c;
  }).join('');
}

const KATAKANA_MAIN = HIRAGANA_MAIN.map(toKatakana);
const DAKUTEN_KATAKANA = DAKUTEN_MAIN.map(toKatakana);
const SMALL_KATAKANA = SMALL_CHARS.map(c => toKatakana(c) ?? c);
const YOON_KATAKANA = YOON_CHARS.map(c => toKatakana(c) ?? c);

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

// 転置関数（列優先→行優先）
function transposeGrid(cells: (string | null)[], cols: number, rows: number): (string | null)[] {
  const result: (string | null)[] = new Array(cols * rows).fill(null);
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      result[row * cols + col] = cells[col * rows + row] ?? null;
    }
  }
  return result;
}

// 横並びグリッドコンポーネント（五十音・濁点用）
function VerticalGrid({
  cells,
  cols,
  rows,
  quizTarget,
  punittoKey,
  onCharClick,
}: {
  cells: (string | null)[];
  cols: number;
  rows: number;
  quizTarget: string;
  punittoKey: string | null;
  onCharClick: (char: string) => void;
}) {
  // データを転置して行優先に変換
  const transposed = transposeGrid(cells, cols, rows);
  let colorIdx = 0;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 56px)`,
        gridAutoFlow: 'row',
        gap: '4px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {transposed.map((char, i) => {
        if (char === null) {
          return <div key={i} style={{ width: 56, height: 56 }} />;
        }
        const ci = colorIdx++;
        return (
          <button
            key={i}
            onClick={() => onCharClick(char)}
            className="rounded-full font-bold transition-all active:scale-90 flex items-center justify-center shadow-md"
            style={{
              backgroundColor: BUTTON_COLORS[ci % BUTTON_COLORS.length],
              width: 56,
              height: 56,
              color: '#4A4A4A',
              border: quizTarget === char ? '3px solid #4A4A4A' : '2px solid rgba(255,255,255,0.7)',
              animation: punittoKey === char ? 'punitto 0.3s ease-in-out' : undefined,
              fontSize: char.length > 1 ? '0.8rem' : '1.4rem',
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

// 横並びグリッドコンポーネント
function HorizontalGrid({
  chars,
  cols,
  colorOffset,
  quizTarget,
  punittoKey,
  onCharClick,
}: {
  chars: string[];
  cols: number;
  colorOffset: number;
  quizTarget: string;
  punittoKey: string | null;
  onCharClick: (char: string) => void;
}) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 56px)` }}
    >
      {chars.map((char, i) => (
        <button
          key={i}
          onClick={() => onCharClick(char)}
          className="rounded-full font-bold transition-all active:scale-90 flex items-center justify-center shadow-md"
          style={{
            backgroundColor: BUTTON_COLORS[(colorOffset + i) % BUTTON_COLORS.length],
            width: 56,
            height: 56,
            color: '#4A4A4A',
            border: quizTarget === char ? '3px solid #4A4A4A' : '2px solid rgba(255,255,255,0.7)',
            animation: punittoKey === char ? 'punitto 0.3s ease-in-out' : undefined,
            fontSize: char.length > 1 ? '0.8rem' : '1.4rem',
          }}
        >
          {char}
        </button>
      ))}
    </div>
  );
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

  // router使用を維持（将来の遷移のため）
  void router;

  useEffect(() => {
    const user = loadUser();
    if (user) setStars(user.stars);
  }, []);

  // クイズ対象となりうる全文字（nullを除く）
  const getAllChars = useCallback((): string[] => {
    const isKana = tab === 'hiragana' || tab === 'katakana';
    if (isKana) {
      const mainData = tab === 'hiragana' ? HIRAGANA_MAIN : KATAKANA_MAIN;
      const dakutenData = tab === 'hiragana' ? DAKUTEN_MAIN : DAKUTEN_KATAKANA;
      const smallData = tab === 'hiragana' ? SMALL_CHARS : SMALL_KATAKANA;
      const yoonData = tab === 'hiragana' ? YOON_CHARS : YOON_KATAKANA;
      return [
        ...mainData.filter((c): c is string => c !== null),
        ...dakutenData.filter((c): c is string => c !== null),
        ...smallData,
        ...yoonData,
      ];
    }
    return ABC;
  }, [tab]);

  const handleCharClick = useCallback((char: string) => {
    if (!char.trim()) return;

    setPunittoKey(char);
    setTimeout(() => setPunittoKey(null), 300);

    setSelected(char);
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 1000);

    const readText = tab === 'abc' ? (ABC_READING[char] ?? char) : char;
    speak(readText);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, quizMode, quizTarget]);

  const startNewQuiz = useCallback(() => {
    const chars = getAllChars();
    const target = chars[Math.floor(Math.random() * chars.length)];
    setQuizTarget(target);
    const readText = tab === 'abc' ? (ABC_READING[target] ?? target) : target;
    speak(`${readText} をおしてね！`);
  }, [tab, getAllChars]);

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

  const isKana = tab === 'hiragana' || tab === 'katakana';
  const mainData = tab === 'hiragana' ? HIRAGANA_MAIN : KATAKANA_MAIN;
  const dakutenData = tab === 'hiragana' ? DAKUTEN_MAIN : DAKUTEN_KATAKANA;
  const smallData = tab === 'hiragana' ? SMALL_CHARS : SMALL_KATAKANA;
  const yoonData = tab === 'hiragana' ? YOON_CHARS : YOON_KATAKANA;

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
        {isKana ? (
          <div className="flex flex-col gap-4">
            {/* 五十音 */}
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>五十音</p>
              <VerticalGrid
                cells={mainData}
                cols={11}
                rows={5}
                quizTarget={quizTarget}
                punittoKey={punittoKey}
                onCharClick={handleCharClick}
              />
            </div>

            {/* だくてん */}
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>だくてん・はんだくてん</p>
              <VerticalGrid
                cells={dakutenData}
                cols={5}
                rows={5}
                quizTarget={quizTarget}
                punittoKey={punittoKey}
                onCharClick={handleCharClick}
              />
            </div>

            {/* こもじ・おんびき */}
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>こもじ・おんびき</p>
              <HorizontalGrid
                chars={smallData}
                cols={5}
                colorOffset={0}
                quizTarget={quizTarget}
                punittoKey={punittoKey}
                onCharClick={handleCharClick}
              />
            </div>

            {/* ようおん */}
            <div>
              <p className="text-xs font-bold mb-1" style={{ color: '#888' }}>ようおん</p>
              <HorizontalGrid
                chars={yoonData}
                cols={3}
                colorOffset={2}
                quizTarget={quizTarget}
                punittoKey={punittoKey}
                onCharClick={handleCharClick}
              />
            </div>
          </div>
        ) : (
          /* ABC */
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {ABC.map((char, i) => (
              <button
                key={`abc-${i}`}
                onClick={() => handleCharClick(char)}
                className="rounded-full font-bold text-xl transition-all active:scale-90 flex items-center justify-center shadow-md"
                style={{
                  backgroundColor: BUTTON_COLORS[i % BUTTON_COLORS.length],
                  minHeight: '56px',
                  color: '#4A4A4A',
                  border: quizMode && char === quizTarget ? '3px solid #4A4A4A' : '2px solid rgba(255,255,255,0.7)',
                  animation: punittoKey === char ? 'punitto 0.3s ease-in-out' : undefined,
                }}
              >
                {char}
              </button>
            ))}
          </div>
        )}
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
