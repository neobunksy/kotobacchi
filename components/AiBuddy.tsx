'use client';

import { useState, useEffect, useRef } from 'react';

export type AiBuddyMood = 'idle' | 'blink' | 'happy' | 'talking' | 'thinking' | 'surprised';
export type AiBuddyCharacter = 'bunny' | 'gorilla';

type AiBuddyProps = {
  size?: number;
  character?: AiBuddyCharacter;
  mood?: AiBuddyMood;
  hat?: string | null;      // 後方互換のため残す（現在は未使用）
  outfit?: string | null;
  accessory?: string | null;
  className?: string;
  onClick?: () => void;
};

type FramePos = [number, number]; // [col, row]

const BUNNY_GRID = { cols: 4, rows: 6 };
const GORILLA_GRID = { cols: 5, rows: 5 };

const BUNNY_MOODS: Record<AiBuddyMood, FramePos[]> = {
  idle:      [[0, 0], [3, 0]],
  blink:     [[1, 0]],
  happy:     [[2, 3], [3, 3]],
  talking:   [[0, 4], [2, 4]],
  thinking:  [[0, 1]],
  surprised: [[2, 0]],
};

const GORILLA_MOODS: Record<AiBuddyMood, FramePos[]> = {
  idle:      [[0, 0], [1, 2]],
  blink:     [[3, 0]],
  happy:     [[1, 0], [4, 1]],
  talking:   [[2, 0], [2, 2]],
  thinking:  [[1, 1], [3, 1]],
  surprised: [[2, 1]],
};

function getFrameStyle(
  character: AiBuddyCharacter,
  col: number,
  row: number,
  size: number
): React.CSSProperties {
  const { cols, rows } = character === 'bunny' ? BUNNY_GRID : GORILLA_GRID;
  const xPct = cols > 1 ? (col / (cols - 1)) * 100 : 0;
  const yPct = rows > 1 ? (row / (rows - 1)) * 100 : 0;
  const src = character === 'bunny' ? '/characters/bunny.png' : '/characters/gorilla.png';

  return {
    width: size,
    height: size,
    backgroundImage: `url(${src})`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'auto',
    borderRadius: '50%',
  };
}

export default function AiBuddy({
  size = 120,
  character = 'bunny',
  mood = 'idle',
  className = '',
  onClick,
}: AiBuddyProps) {
  const moods = character === 'bunny' ? BUNNY_MOODS : GORILLA_MOODS;
  const frames = moods[mood] ?? moods.idle;

  const [frameIdx, setFrameIdx] = useState(0);
  const [displayMood, setDisplayMood] = useState<AiBuddyMood>(mood);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // mood が変わったら displayMood を更新・frameIdx をリセット
  useEffect(() => {
    setDisplayMood(mood);
    setFrameIdx(0);
  }, [mood]);

  // フレームを定期的に切り替え（talking は速め、idle は遅め）
  useEffect(() => {
    if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    const currentFrames = moods[displayMood] ?? moods.idle;
    if (currentFrames.length <= 1) return;

    const interval = displayMood === 'talking' ? 350 : 2500;
    frameTimerRef.current = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % currentFrames.length);
    }, interval);

    return () => {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
    };
  }, [displayMood, moods]);

  // idle 中はランダムにまばたき
  useEffect(() => {
    if (displayMood !== 'idle') return;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 4000;
      blinkTimerRef.current = setTimeout(() => {
        setDisplayMood('blink');
        setTimeout(() => {
          setDisplayMood('idle');
          setFrameIdx(0);
          scheduleBlink();
        }, 180);
      }, delay);
    };

    scheduleBlink();

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [mood, displayMood]);

  const currentFrames = moods[displayMood] ?? moods.idle;
  const [col, row] = currentFrames[frameIdx] ?? currentFrames[0];
  const frameStyle = getFrameStyle(character, col, row, size);

  // frames は変数として参照されないが、後方互換のため型チェック用に保持
  void frames;

  return (
    <div
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'ことばっちをタップ' : undefined}
    >
      {/* キャラクタースプライト */}
      <div
        style={{
          ...frameStyle,
          transition: 'background-position 0.1s ease',
        }}
      />
    </div>
  );
}
