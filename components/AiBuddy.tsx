'use client';

import { useState, useEffect, useRef } from 'react';

export type AiBuddyMood = 'idle' | 'talking' | 'thinking' | 'happy';
export type AiBuddyCharacter = 'bunny' | 'gorilla';

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
// 目の中心に白い丸を重ねてまばたきを再現
const BUNNY_EYES = [
  { left: '33%', top: '42%', w: '11%', h: '9%' },  // 左目
  { left: '57%', top: '42%', w: '11%', h: '9%' },  // 右目
];

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
          } else {
            // ゴリラ: opacity クロスフェード
            setGorillaBlinkOpacity(1);
            const t1 = setTimeout(() => setGorillaBlinkOpacity(0), 160);
            const t2 = setTimeout(() => loop(), 320);
            seqRef.current = [t1, t2];
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
            {/* まばたき: 目の上に白い丸を重ねる */}
            {isBlinking && BUNNY_EYES.map((eye, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: eye.left,
                  top: eye.top,
                  width: eye.w,
                  height: eye.h,
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  pointerEvents: 'none',
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
      </div>
    </div>
  );
}
