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

// ── SVGキャラ: うさぎ ──
function BunnySvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#F5F0EC" stroke="#E0D0C8" strokeWidth="0.8" />
      {/* 耳（左） */}
      <ellipse cx="34" cy="22" rx="6" ry="18" fill="#F0EBE6" stroke="#E0D0C8" strokeWidth="0.8" />
      <ellipse cx="34" cy="22" rx="3.5" ry="13" fill="#FFB6C1" />
      {/* 耳（右） */}
      <ellipse cx="66" cy="22" rx="6" ry="18" fill="#F0EBE6" stroke="#E0D0C8" strokeWidth="0.8" />
      <ellipse cx="66" cy="22" rx="3.5" ry="13" fill="#FFB6C1" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#F5F0EC" stroke="#E0D0C8" strokeWidth="0.8" />
      {/* 目（白目） */}
      {isBlinking ? (
        <>
          <path d="M 32 47 Q 40 43 48 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 47 Q 60 43 68 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="47" r="8" fill="white" />
          <circle cx="60" cy="47" r="8" fill="white" />
          {/* 黒目 */}
          <circle cx="40" cy="47" r="5.5" fill="#2A1A1A" />
          <circle cx="60" cy="47" r="5.5" fill="#2A1A1A" />
          {/* ハイライト */}
          <circle cx="42.5" cy="44.5" r="2" fill="white" />
          <circle cx="62.5" cy="44.5" r="2" fill="white" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* 鼻 */}
      <circle cx="50" cy="56" r="2.5" fill="#FFB6C1" />
      {/* 口 */}
      <path d="M44 62 Q50 66 56 62" stroke="#C06080" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: ゴリラ ──
function GorillaSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#6B5040" />
      {/* 耳（左） */}
      <circle cx="24" cy="46" r="9" fill="#5A4030" />
      {/* 耳（右） */}
      <circle cx="76" cy="46" r="9" fill="#5A4030" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#6B5040" />
      {/* 顔のマスク部分 */}
      <ellipse cx="50" cy="50" rx="20" ry="18" fill="#C8A882" />
      {/* 目（白目） */}
      {isBlinking ? (
        <>
          <path d="M 32 47 Q 40 43 48 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 47 Q 60 43 68 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="47" r="8" fill="white" />
          <circle cx="60" cy="47" r="8" fill="white" />
          {/* 黒目 */}
          <circle cx="40" cy="47" r="5.5" fill="#2A1A1A" />
          <circle cx="60" cy="47" r="5.5" fill="#2A1A1A" />
          {/* ハイライト */}
          <circle cx="42.5" cy="44.5" r="2" fill="white" />
          <circle cx="62.5" cy="44.5" r="2" fill="white" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* 鼻 */}
      <ellipse cx="50" cy="55" rx="5" ry="4" fill="#3A2010" />
      <ellipse cx="47.5" cy="54" rx="1.8" ry="1.5" fill="#2A1008" />
      <ellipse cx="52.5" cy="54" rx="1.8" ry="1.5" fill="#2A1008" />
      {/* 口 */}
      <path d="M43 63 Q50 69 57 63" stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: 猫 ──
function CatSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#F4C890" />
      {/* 耳（左） */}
      <polygon points="24,30 18,12 34,26" fill="#F4C890" />
      <polygon points="25,28 21,15 31,25" fill="#FFB6C1" />
      {/* 耳（右） */}
      <polygon points="76,30 82,12 66,26" fill="#F4C890" />
      <polygon points="75,28 79,15 69,25" fill="#FFB6C1" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#F4C890" />
      {/* 目（白目） */}
      {isBlinking ? (
        <>
          <path d="M 32 47 Q 40 43 48 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 47 Q 60 43 68 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="40" cy="47" rx="6" ry="7" fill="white" />
          <ellipse cx="60" cy="47" rx="6" ry="7" fill="white" />
          {/* 黒目 */}
          <ellipse cx="40" cy="47" rx="4" ry="5.5" fill="#2A1A1A" />
          <ellipse cx="60" cy="47" rx="4" ry="5.5" fill="#2A1A1A" />
          {/* ハイライト */}
          <circle cx="42" cy="44.5" r="1.8" fill="white" />
          <circle cx="62" cy="44.5" r="1.8" fill="white" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* ヒゲ（左） */}
      <line x1="22" y1="54" x2="38" y2="55" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      <line x1="20" y1="57" x2="38" y2="57" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      <line x1="22" y1="60" x2="38" y2="59" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      {/* ヒゲ（右） */}
      <line x1="78" y1="54" x2="62" y2="55" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      <line x1="80" y1="57" x2="62" y2="57" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      <line x1="78" y1="60" x2="62" y2="59" stroke="#C8A070" strokeWidth="0.8" opacity="0.7" />
      {/* 鼻 */}
      <ellipse cx="50" cy="56" rx="2.5" ry="1.8" fill="#FFB6C1" />
      {/* 口 */}
      <path d="M44 62 Q50 66 56 62" stroke="#C06080" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: 犬 ──
function DogSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#E8C99A" />
      {/* 垂れ耳（左） */}
      <ellipse cx="21" cy="50" rx="11" ry="16" fill="#C8956C" />
      {/* 垂れ耳（右） */}
      <ellipse cx="79" cy="50" rx="11" ry="16" fill="#C8956C" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#E8C99A" />
      {/* 目（白目） */}
      {isBlinking ? (
        <>
          <path d="M 32 47 Q 40 43 48 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 47 Q 60 43 68 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="47" r="8" fill="white" />
          <circle cx="60" cy="47" r="8" fill="white" />
          {/* 黒目 */}
          <circle cx="40" cy="47" r="5.5" fill="#2A1A1A" />
          <circle cx="60" cy="47" r="5.5" fill="#2A1A1A" />
          {/* ハイライト */}
          <circle cx="42.5" cy="44.5" r="2" fill="white" />
          <circle cx="62.5" cy="44.5" r="2" fill="white" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* 大きな鼻 */}
      <ellipse cx="50" cy="58" rx="8" ry="6" fill="#2A1A0A" />
      <ellipse cx="47.5" cy="56" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)" />
      {/* 口 */}
      <path d="M43 65 Q50 70 57 65" stroke="#C06080" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* 舌 */}
      <ellipse cx="50" cy="69" rx="5" ry="3.5" fill="#FF8FAB" />
    </svg>
  );
}

// ── SVGキャラ: ナマケモノ ──
function SlothSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#A8BF94" />
      {/* 耳（左） */}
      <circle cx="24" cy="38" r="8" fill="#90A87C" />
      {/* 耳（右） */}
      <circle cx="76" cy="38" r="8" fill="#90A87C" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#A8BF94" />
      {/* 顔の薄い部分 */}
      <ellipse cx="50" cy="52" rx="18" ry="14" fill="#C4D8B0" />
      {/* 目（半目がデフォルト） */}
      {isBlinking ? (
        <>
          <path d="M 32 47 Q 40 43 48 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 52 47 Q 60 43 68 47" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="47" r="8" fill="white" />
          <circle cx="60" cy="47" r="8" fill="white" />
          {/* 黒目 */}
          <circle cx="40" cy="47" r="5.5" fill="#2A1A1A" />
          <circle cx="60" cy="47" r="5.5" fill="#2A1A1A" />
          {/* ハイライト */}
          <circle cx="42.5" cy="44.5" r="2" fill="white" />
          <circle cx="62.5" cy="44.5" r="2" fill="white" />
          {/* まぶた（半目・眠そう） */}
          <rect x="32" y="39" width="16" height="8" rx="3" fill="#A8BF94" />
          <rect x="52" y="39" width="16" height="8" rx="3" fill="#A8BF94" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="58" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* 鼻 */}
      <ellipse cx="50" cy="58" rx="3" ry="2" fill="#7A9068" />
      {/* 口 */}
      <path d="M44 62 Q50 66 56 62" stroke="#C06080" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* ひっかき爪（左腕） */}
      <path d="M 32 78 Q 24 82 22 88" stroke="#90A87C" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* ひっかき爪（右腕） */}
      <path d="M 68 78 Q 76 82 78 88" stroke="#90A87C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: モモンガ ──
function MomongaSvg({ isBlinking }: { isBlinking: boolean }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 滑空膜（左） */}
      <path d="M28 56 Q8 72 14 86 Q28 76 36 70 Z" fill="#C8C4E0" opacity="0.6" />
      {/* 滑空膜（右） */}
      <path d="M72 56 Q92 72 86 86 Q72 76 64 70 Z" fill="#C8C4E0" opacity="0.6" />
      {/* 体 */}
      <ellipse cx="50" cy="78" rx="16" ry="12" fill="#D8D4EC" />
      {/* 耳（左） */}
      <ellipse cx="26" cy="28" rx="5" ry="7" fill="#BDBDE8" />
      {/* 耳（右） */}
      <ellipse cx="74" cy="28" rx="5" ry="7" fill="#BDBDE8" />
      {/* 頭 */}
      <circle cx="50" cy="46" r="26" fill="#D8D4EC" />
      {/* 目（超巨大） */}
      {isBlinking ? (
        <>
          <path d="M 25 48 Q 37 42 49 48" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 51 48 Q 63 42 75 48" stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* 白目（超大きい） */}
          <circle cx="37" cy="48" r="12" fill="white" />
          <circle cx="63" cy="48" r="12" fill="white" />
          {/* 黒目 */}
          <circle cx="37" cy="48" r="9" fill="#1A1A1A" />
          <circle cx="63" cy="48" r="9" fill="#1A1A1A" />
          {/* ハイライト */}
          <circle cx="41" cy="44" r="3" fill="white" />
          <circle cx="67" cy="44" r="3" fill="white" />
        </>
      )}
      {/* ほっぺ */}
      <ellipse cx="37" cy="62" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      <ellipse cx="63" cy="62" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.55" />
      {/* 鼻 */}
      <ellipse cx="50" cy="62" rx="2.5" ry="1.8" fill="#BDBDE8" />
      {/* 口 */}
      <path d="M44 66 Q50 70 56 66" stroke="#C06080" strokeWidth="1.8" fill="none" strokeLinecap="round" />
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
      setIsWaving(false);
      return;
    }

    const loop = () => {
      const delay = 2200 + Math.random() * 4000;
      loopRef.current = setTimeout(() => {
        const rand = Math.random();

        if (rand < 0.65) {
          // まばたき（全キャラ共通SVG）
          setIsBlinking(true);
          const t1 = setTimeout(() => { setIsBlinking(false); loop(); }, 170);
          seqRef.current = [t1];
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
        {character === 'bunny' && <BunnySvg isBlinking={isBlinking} />}

        {/* ── ゴリラ ── */}
        {character === 'gorilla' && <GorillaSvg isBlinking={isBlinking} />}

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
