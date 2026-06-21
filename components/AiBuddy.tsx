'use client';

import { useState, useEffect, useRef } from 'react';
import type { AiBuddyCharacter } from '@/lib/store';

export type { AiBuddyCharacter };
export type AiBuddyMood = 'idle' | 'talking' | 'thinking' | 'happy';

type AiBuddyProps = {
  size?: number;
  character?: AiBuddyCharacter;
  mood?: AiBuddyMood;
  hat?: string | null;
  outfit?: string | null;
  accessory?: string | null;
  className?: string;
  onClick?: () => void;
};

// うさぎの目の位置（bunny-idle.png 256x256 基準・%指定）
const BUNNY_EYES = [
  { left: '22%', top: '33%', w: '22%', h: '18%' },  // 左目
  { left: '50%', top: '33%', w: '22%', h: '18%' },  // 右目
];

// ── SVGキャラ: 猫 ──
function CatSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="72" rx="24" ry="18" fill="#F4C08A" />
      {/* 頭 */}
      <circle cx="50" cy="48" r="26" fill="#F4C08A" />
      {/* 三角耳（左） */}
      <polygon points="26,32 18,12 36,26" fill="#F4C08A" />
      <polygon points="27,30 22,16 34,26" fill="#FFB6C1" />
      {/* 三角耳（右） */}
      <polygon points="74,32 82,12 64,26" fill="#F4C08A" />
      <polygon points="73,30 78,16 66,26" fill="#FFB6C1" />
      {/* 左目 */}
      {isBlinking ? (
        <path d="M 36 47 Q 41 43 46 47" stroke="#5A3E28" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="41" cy="47" rx="5" ry="6" fill="#5A3E28" />
      )}
      {/* 右目 */}
      {isBlinking ? (
        <path d="M 54 47 Q 59 43 64 47" stroke="#5A3E28" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="59" cy="47" rx="5" ry="6" fill="#5A3E28" />
      )}
      {/* 目のハイライト */}
      {!isBlinking && (
        <>
          <circle cx="43" cy="45" r="1.5" fill="white" />
          <circle cx="61" cy="45" r="1.5" fill="white" />
        </>
      )}
      {/* 鼻 */}
      <ellipse cx="50" cy="56" rx="3" ry="2" fill="#FF9999" />
      {/* 口 */}
      <path d="M 47 58 Q 50 62 53 58" stroke="#CC7777" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* ヒゲ（左） */}
      <line x1="22" y1="54" x2="44" y2="55" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      <line x1="22" y1="57" x2="44" y2="57" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      <line x1="22" y1="60" x2="44" y2="59" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      {/* ヒゲ（右） */}
      <line x1="78" y1="54" x2="56" y2="55" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      <line x1="78" y1="57" x2="56" y2="57" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      <line x1="78" y1="60" x2="56" y2="59" stroke="#9B7B5B" strokeWidth="1" opacity="0.7" />
      {/* しっぽ */}
      <path d="M 72 80 Q 88 72 82 62" stroke="#F4C08A" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: 犬 ──
function DogSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="74" rx="22" ry="17" fill="#C8956C" />
      {/* 頭 */}
      <circle cx="50" cy="48" r="25" fill="#C8956C" />
      {/* 垂れ耳（左） */}
      <ellipse cx="26" cy="44" rx="10" ry="16" fill="#A6754F" />
      {/* 垂れ耳（右） */}
      <ellipse cx="74" cy="44" rx="10" ry="16" fill="#A6754F" />
      {/* 左目 */}
      {isBlinking ? (
        <path d="M 36 46 Q 41 42 46 46" stroke="#3A2510" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="41" cy="47" r="6" fill="#3A2510" />
      )}
      {/* 右目 */}
      {isBlinking ? (
        <path d="M 54 46 Q 59 42 64 46" stroke="#3A2510" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="59" cy="47" r="6" fill="#3A2510" />
      )}
      {/* 目のハイライト */}
      {!isBlinking && (
        <>
          <circle cx="44" cy="44" r="2" fill="white" />
          <circle cx="62" cy="44" r="2" fill="white" />
        </>
      )}
      {/* 大きな鼻 */}
      <ellipse cx="50" cy="57" rx="8" ry="6" fill="#2A1A0A" />
      <ellipse cx="48" cy="55" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)" />
      {/* 口 */}
      <path d="M 44 63 Q 50 68 56 63" stroke="#7A4A30" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="50" y1="63" x2="50" y2="67" stroke="#7A4A30" strokeWidth="2" strokeLinecap="round" />
      {/* しっぽ */}
      <path d="M 70 78 Q 84 68 78 60" stroke="#C8956C" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: ナマケモノ ──
function SlothSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="75" rx="20" ry="16" fill="#9CAF88" />
      {/* 頭 */}
      <circle cx="50" cy="50" r="26" fill="#9CAF88" />
      {/* 顔のマスク部分（薄い色） */}
      <ellipse cx="50" cy="55" rx="18" ry="14" fill="#B8C9A4" />
      {/* 耳（左） */}
      <circle cx="25" cy="40" r="9" fill="#8A9E76" />
      <circle cx="25" cy="40" r="5" fill="#9CAF88" />
      {/* 耳（右） */}
      <circle cx="75" cy="40" r="9" fill="#8A9E76" />
      <circle cx="75" cy="40" r="5" fill="#9CAF88" />
      {/* 半目（眠そう） - 常に半分閉じ気味 */}
      {isBlinking ? (
        <>
          <path d="M 35 48 Q 41 46 47 48" stroke="#4A5A38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 53 48 Q 59 46 65 48" stroke="#4A5A38" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* 目の白目 */}
          <ellipse cx="41" cy="49" rx="6" ry="5" fill="white" />
          <ellipse cx="59" cy="49" rx="6" ry="5" fill="white" />
          {/* 瞳（半分隠れている） */}
          <ellipse cx="41" cy="50" rx="4" ry="3.5" fill="#4A5A38" />
          <ellipse cx="59" cy="50" rx="4" ry="3.5" fill="#4A5A38" />
          {/* まぶた（半分かぶっている） */}
          <rect x="35" y="44" width="12" height="5" rx="2" fill="#9CAF88" />
          <rect x="53" y="44" width="12" height="5" rx="2" fill="#9CAF88" />
        </>
      )}
      {/* 鼻 */}
      <ellipse cx="50" cy="57" rx="3.5" ry="2.5" fill="#6A7A58" />
      {/* のんびりした口（少し上向き） */}
      <path d="M 44 62 Q 50 65 56 62" stroke="#6A7A58" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 爪（左腕） */}
      <path d="M 30 68 Q 20 72 18 80" stroke="#8A9E76" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* 爪（右腕） */}
      <path d="M 70 68 Q 80 72 82 80" stroke="#8A9E76" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: モモンガ ──
function MomongaSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 滑空膜（左） */}
      <path d="M 28 55 Q 10 70 15 85 Q 28 75 35 70 Z" fill="#C8C8C8" opacity="0.7" />
      {/* 滑空膜（右） */}
      <path d="M 72 55 Q 90 70 85 85 Q 72 75 65 70 Z" fill="#C8C8C8" opacity="0.7" />
      {/* 体（小さめ） */}
      <ellipse cx="50" cy="74" rx="16" ry="13" fill="#DCDCDC" />
      {/* 頭（大きめ） */}
      <circle cx="50" cy="48" r="27" fill="#DCDCDC" />
      {/* 耳（小さい） */}
      <ellipse cx="28" cy="28" rx="6" ry="8" fill="#BDBDBD" />
      <ellipse cx="72" cy="28" rx="6" ry="8" fill="#BDBDBD" />
      {/* 巨大な丸い目 */}
      {isBlinking ? (
        <>
          <path d="M 30 48 Q 39 42 48 48" stroke="#2A2A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 48 Q 61 42 70 48" stroke="#2A2A2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* 目の白目（超大きい） */}
          <circle cx="39" cy="49" r="11" fill="white" />
          <circle cx="61" cy="49" r="11" fill="white" />
          {/* 瞳 */}
          <circle cx="39" cy="50" r="8" fill="#1A1A1A" />
          <circle cx="61" cy="50" r="8" fill="#1A1A1A" />
          {/* 瞳孔の輝き */}
          <circle cx="42" cy="46" r="3" fill="white" />
          <circle cx="64" cy="46" r="3" fill="white" />
          <circle cx="43" cy="47" r="1" fill="white" opacity="0.5" />
          <circle cx="65" cy="47" r="1" fill="white" opacity="0.5" />
        </>
      )}
      {/* 鼻（小さい） */}
      <ellipse cx="50" cy="60" rx="2.5" ry="1.8" fill="#AAAAAA" />
      {/* 小さな口 */}
      <path d="M 46 63 Q 50 66 54 63" stroke="#AAAAAA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* しっぽ */}
      <path d="M 62 82 Q 72 85 68 92" stroke="#C0C0C0" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function AiBuddy({
  size = 120,
  character = 'bunny',
  mood = 'idle',
  className = '',
  onClick,
}: AiBuddyProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [gorillaBlinkOpacity, setGorillaBlinkOpacity] = useState(0);
  const [isWaving, setIsWaving] = useState(false);
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSeq = () => {
    seqRef.current.forEach(t => clearTimeout(t));
    seqRef.current = [];
  };

  // idle 中にランダムでまばたき・手振り
  useEffect(() => {
    if (mood !== 'idle') {
      if (loopRef.current) clearTimeout(loopRef.current);
      clearSeq();
      setIsBlinking(false);
      setGorillaBlinkOpacity(0);
      setIsWaving(false);
      return;
    }

    const loop = () => {
      const delay = 2200 + Math.random() * 4000;
      loopRef.current = setTimeout(() => {
        const rand = Math.random();

        if (rand < 0.65) {
          // まばたき
          if (character === 'bunny') {
            setIsBlinking(true);
            const t1 = setTimeout(() => { setIsBlinking(false); loop(); }, 170);
            seqRef.current = [t1];
          } else if (character === 'gorilla') {
            // ゴリラ: opacity クロスフェード
            setGorillaBlinkOpacity(1);
            const t1 = setTimeout(() => setGorillaBlinkOpacity(0), 160);
            const t2 = setTimeout(() => loop(), 320);
            seqRef.current = [t1, t2];
          } else {
            // SVGキャラ: isBlinking フラグで目を閉じる
            setIsBlinking(true);
            const t1 = setTimeout(() => { setIsBlinking(false); loop(); }, 170);
            seqRef.current = [t1];
          }
        } else {
          // 手振り（傾きアニメ）
          setIsWaving(true);
          const t1 = setTimeout(() => { setIsWaving(false); loop(); }, 700);
          seqRef.current = [t1];
        }
      }, delay);
    };

    loop();

    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
      clearSeq();
    };
  }, [mood, character]);

  // mood に応じた動きアニメ
  const motionClass =
    isWaving       ? 'animate-charWave'
    : mood === 'talking'  ? 'animate-charTalk'
    : mood === 'thinking' ? 'animate-charThink'
    : mood === 'happy'    ? 'animate-charHappy'
    : 'animate-charFloat';

  return (
    <div
      className={`select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size, position: 'relative' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'ことばっちをタップ' : undefined}
    >
      <div
        className={motionClass}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {/* ── うさぎ ── */}
        {character === 'bunny' && (
          <>
            <img
              src="/characters/bunny-idle.png"
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
            {/* まばたき: 目全体を覆う楕円で目閉じを表現 */}
            {isBlinking && BUNNY_EYES.map((eye, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: eye.left,
                  top: eye.top,
                  width: eye.w,
                  height: eye.h,
                  backgroundColor: '#fff5ee',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 0 rgba(220,180,170,0.5)',
                }}
              />
            ))}
          </>
        )}

        {/* ── ゴリラ ── */}
        {character === 'gorilla' && (
          <>
            {/* ベース（目が開いている） */}
            <img
              src="/characters/gorilla-idle.png"
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', position: 'absolute', inset: 0 }}
            />
            {/* まばたき（目が閉じている）: opacity フェード */}
            <img
              src="/characters/gorilla-blink.png"
              alt=""
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                position: 'absolute',
                inset: 0,
                opacity: gorillaBlinkOpacity,
                transition: 'opacity 0.07s ease',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* ── 猫 ── */}
        {character === 'cat' && <CatSvg isBlinking={isBlinking} />}

        {/* ── 犬 ── */}
        {character === 'dog' && <DogSvg isBlinking={isBlinking} />}

        {/* ── ナマケモノ ── */}
        {character === 'sloth' && <SlothSvg isBlinking={isBlinking} />}

        {/* ── モモンガ ── */}
        {character === 'momonga' && <MomongaSvg isBlinking={isBlinking} />}
      </div>
    </div>
  );
}
