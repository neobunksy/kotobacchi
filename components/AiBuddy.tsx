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

type FramePos = [number, number]; // [col, row]

const BUNNY_GRID = { cols: 4, rows: 6 };
const GORILLA_GRID = { cols: 5, rows: 5 };

// 各 mood の固定表示フレーム（頻繁に切り替えない）
const BUNNY = {
  idle:     [0, 0] as FramePos,
  talking:  [0, 4] as FramePos,
  thinking: [0, 1] as FramePos,
  happy:    [2, 3] as FramePos,
  blink:    [1, 0] as FramePos,  // まばたき一時フレーム
  wave:     [3, 3] as FramePos,  // 手振り一時フレーム
};

const GORILLA = {
  idle:     [0, 0] as FramePos,
  talking:  [2, 2] as FramePos,
  thinking: [1, 1] as FramePos,
  happy:    [1, 0] as FramePos,
  blink:    [3, 0] as FramePos,
  wave:     [4, 1] as FramePos,
};

function frameToBgStyle(
  character: AiBuddyCharacter,
  frame: FramePos,
  size: number
): React.CSSProperties {
  const grid = character === 'bunny' ? BUNNY_GRID : GORILLA_GRID;
  const src = character === 'bunny' ? '/characters/bunny.png' : '/characters/gorilla.png';
  const [col, row] = frame;
  const xPct = grid.cols > 1 ? (col / (grid.cols - 1)) * 100 : 0;
  const yPct = grid.rows > 1 ? (row / (grid.rows - 1)) * 100 : 0;

  return {
    position: 'absolute',
    inset: 0,
    width: size,
    height: size,
    backgroundImage: `url(${src})`,
    backgroundSize: `${grid.cols * 100}% ${grid.rows * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export default function AiBuddy({
  size = 120,
  character = 'bunny',
  mood = 'idle',
  className = '',
  onClick,
}: AiBuddyProps) {
  const frames = character === 'bunny' ? BUNNY : GORILLA;
  const baseFrame: FramePos = frames[mood] ?? frames.idle;

  // オーバーレイ（まばたき・手振り）は opacity cross-fade で実現
  const [overlayFrame, setOverlayFrame] = useState<FramePos>(frames.blink);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearSequence = () => {
    sequenceTimersRef.current.forEach(t => clearTimeout(t));
    sequenceTimersRef.current = [];
  };

  // idle 中のランダムアクション（まばたき・手振り）
  useEffect(() => {
    if (mood !== 'idle') {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      clearSequence();
      setOverlayOpacity(0);
      return;
    }

    const loop = () => {
      const delay = 2500 + Math.random() * 4000;
      loopTimerRef.current = setTimeout(() => {
        const isWave = Math.random() < 0.28;
        const targetFrame = isWave ? frames.wave : frames.blink;
        const holdMs = isWave ? 750 : 160;

        setOverlayFrame(targetFrame);

        // フェードイン → 表示維持 → フェードアウト → 次のループ
        const t1 = setTimeout(() => setOverlayOpacity(1), 16);
        const t2 = setTimeout(() => setOverlayOpacity(0), 16 + holdMs);
        const t3 = setTimeout(() => loop(), 16 + holdMs + 100);
        sequenceTimersRef.current = [t1, t2, t3];
      }, delay);
    };

    loop();

    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      clearSequence();
    };
  }, [mood, frames]);

  const animClass =
    mood === 'talking'  ? 'animate-charTalk'
    : mood === 'thinking' ? 'animate-charThink'
    : mood === 'happy'    ? 'animate-charHappy'
    : 'animate-charFloat';

  return (
    <div
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'ことばっちをタップ' : undefined}
    >
      <div className={animClass} style={{ position: 'relative', width: size, height: size }}>
        {/* ベースレイヤー（mood に応じた固定フレーム） */}
        <div style={frameToBgStyle(character, baseFrame, size)} />

        {/* オーバーレイ（まばたき・手振り - opacity でフェード） */}
        <div
          style={{
            ...frameToBgStyle(character, overlayFrame, size),
            opacity: overlayOpacity,
            transition: 'opacity 0.08s ease',
          }}
        />
      </div>
    </div>
  );
}
