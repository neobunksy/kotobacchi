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
function BunnySvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 39;
  const EYE_R = 61;
  const EYE_Y = 46;
  const EYE_W = 9;
  const PUPIL_R = 6.5;
  const HL_R = 2.5;
  const MOUTH_Y = 57;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 7} ${EYE_Y} Q ${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 8} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 8} ${cx + 8} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={EYE_Y} r={EYE_W} fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <circle cx={cx} cy={EYE_Y} r={PUPIL_R} fill="#1A1A1A" />
        <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={HL_R} fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    // idle
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="13" ry="9" fill="#FFF0F5" stroke="#E8D0DA" strokeWidth="1" />
      {/* 耳左外 */}
      <ellipse cx="33" cy="18" rx="6" ry="18" fill="#F5E0E8" stroke="#E8D0DA" strokeWidth="1" />
      {/* 耳左内 */}
      <ellipse cx="33" cy="18" rx="3.5" ry="13" fill="#FFB6C1" />
      {/* 耳右外 */}
      <ellipse cx="67" cy="18" rx="6" ry="18" fill="#F5E0E8" stroke="#E8D0DA" strokeWidth="1" />
      {/* 耳右内 */}
      <ellipse cx="67" cy="18" rx="3.5" ry="13" fill="#FFB6C1" />
      {/* 頭 */}
      <circle cx="50" cy="44" r="28" fill="#FFF0F5" stroke="#E8D0DA" strokeWidth="1.2" />
      {/* 目 */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      {/* 鼻 */}
      <circle cx="50" cy="54" r="2.5" fill="#FFB6C1" />
      {/* 口 */}
      {renderMouth()}
    </svg>
  );
}

// ── SVGキャラ: ゴリラ ──
function GorillaSvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 39;
  const EYE_R = 61;
  const EYE_Y = 44;
  const EYE_W = 8.5;
  const PUPIL_R = 6;
  const HL_R = 2.2;
  const MOUTH_Y = 59;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 7} ${EYE_Y} Q ${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 8} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 8} ${cx + 8} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={EYE_Y} r={EYE_W} fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <circle cx={cx} cy={EYE_Y} r={PUPIL_R} fill="#1A1A1A" />
        <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={HL_R} fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="14" ry="10" fill="#9B8BB0" />
      {/* 耳左 */}
      <circle cx="22" cy="44" r="10" fill="#8A7A9F" stroke="#6A5A7F" strokeWidth="0.8" />
      {/* 耳右 */}
      <circle cx="78" cy="44" r="10" fill="#8A7A9F" stroke="#6A5A7F" strokeWidth="0.8" />
      {/* 頭 */}
      <circle cx="50" cy="42" r="28" fill="#9B8BB0" stroke="#6A5A7F" strokeWidth="1.2" />
      {/* 頭のコブ（頭頂部の盛り上がり） */}
      <ellipse cx="50" cy="16" rx="10" ry="6" fill="#9B8BB0" />
      {/* 顔マスク */}
      <ellipse cx="50" cy="50" rx="19" ry="16" fill="#D4C0A8" />
      {/* 目 */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="58" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="58" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      {/* 鼻 */}
      <ellipse cx="50" cy="54" rx="5.5" ry="4" fill="#5A3A20" />
      <ellipse cx="47.5" cy="53" rx="2" ry="1.5" fill="#3A2010" />
      <ellipse cx="52.5" cy="53" rx="2" ry="1.5" fill="#3A2010" />
      {/* 口 */}
      {renderMouth()}
    </svg>
  );
}

// ── SVGキャラ: 猫 ──
function CatSvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 39;
  const EYE_R = 61;
  const EYE_Y = 45;
  const MOUTH_Y = 57;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 7} ${EYE_Y} Q ${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 8} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 8} ${cx + 8} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    // 猫目（縦細）
    return (
      <>
        <ellipse cx={cx} cy={EYE_Y} rx="6.5" ry="8" fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <ellipse cx={cx} cy={EYE_Y} rx="4" ry="6.5" fill="#1A1A1A" />
        <circle cx={cx + 1.5} cy={EYE_Y - 2} r="1.8" fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="13" ry="9" fill="#F5C5A0" />
      {/* 耳左外 */}
      <polygon points="24,30 16,10 36,26" fill="#F5C5A0" stroke="#D4A070" strokeWidth="1" />
      {/* 耳左内 */}
      <polygon points="26,28 21,14 33,25" fill="#FFB6C1" />
      {/* 耳右外 */}
      <polygon points="76,30 84,10 64,26" fill="#F5C5A0" stroke="#D4A070" strokeWidth="1" />
      {/* 耳右内 */}
      <polygon points="74,28 79,14 67,25" fill="#FFB6C1" />
      {/* 頭 */}
      <circle cx="50" cy="44" r="27" fill="#F5C5A0" stroke="#D4A070" strokeWidth="1.2" />
      {/* おでこの縞（3本線） */}
      <line x1="48" y1="22" x2="46" y2="30" stroke="#D4A070" strokeWidth="1" opacity="0.6" />
      <line x1="50" y1="20" x2="50" y2="29" stroke="#D4A070" strokeWidth="1" opacity="0.6" />
      <line x1="52" y1="22" x2="54" y2="30" stroke="#D4A070" strokeWidth="1" opacity="0.6" />
      {/* 目 */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      {/* ヒゲ左3本 */}
      <line x1="20" y1="52" x2="37" y2="54" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      <line x1="18" y1="56" x2="37" y2="56" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="60" x2="37" y2="58" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      {/* ヒゲ右3本 */}
      <line x1="80" y1="52" x2="63" y2="54" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      <line x1="82" y1="56" x2="63" y2="56" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      <line x1="80" y1="60" x2="63" y2="58" stroke="#C8A070" strokeWidth="0.8" opacity="0.5" />
      {/* 鼻 */}
      <ellipse cx="50" cy="54" rx="2.5" ry="2" fill="#FFB6C1" />
      {/* 口 */}
      {renderMouth()}
    </svg>
  );
}

// ── SVGキャラ: 犬 ──
function DogSvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 39;
  const EYE_R = 61;
  const EYE_Y = 44;
  const EYE_W = 9;
  const PUPIL_R = 6.5;
  const HL_R = 2.5;
  const MOUTH_Y = 64;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 7} ${EYE_Y} Q ${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 8} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 8} ${cx + 8} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={EYE_Y} r={EYE_W} fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <circle cx={cx} cy={EYE_Y} r={PUPIL_R} fill="#1A1A1A" />
        <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={HL_R} fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  const showTongue = mood === 'idle' || mood === 'happy';

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="13" ry="9" fill="#EDD5A0" />
      {/* 垂れ耳左 */}
      <ellipse cx="20" cy="53" rx="10" ry="19" fill="#C8956C" stroke="#A07040" strokeWidth="0.8" />
      {/* 垂れ耳右 */}
      <ellipse cx="80" cy="53" rx="10" ry="19" fill="#C8956C" stroke="#A07040" strokeWidth="0.8" />
      {/* 頭 */}
      <circle cx="50" cy="42" r="28" fill="#EDD5A0" stroke="#C0A070" strokeWidth="1.2" />
      {/* 目 */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="55" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      {/* 大きな丸鼻 */}
      <ellipse cx="50" cy="57" rx="8" ry="6" fill="#3A2010" stroke="#2A1008" strokeWidth="0.5" />
      <ellipse cx="47" cy="55" rx="2.2" ry="1.6" fill="rgba(255,255,255,0.25)" />
      {/* 口 */}
      {renderMouth()}
      {/* 舌（idle/happyのみ） */}
      {showTongue && <ellipse cx="50" cy="68" rx="6" ry="4" fill="#FF8FAB" />}
    </svg>
  );
}

// ── SVGキャラ: ナマケモノ ──
function SlothSvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 39;
  const EYE_R = 61;
  const EYE_Y = 46;
  const EYE_W = 8.5;
  const PUPIL_R = 6;
  const HL_R = 2;
  const MOUTH_Y = 60;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 7} ${EYE_Y} Q ${cx} ${EYE_Y + 5} ${cx + 7} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 8} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 8} ${cx + 8} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={EYE_Y} r={EYE_W} fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <circle cx={cx} cy={EYE_Y} r={PUPIL_R} fill="#1A1A1A" />
        <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={HL_R} fill="white" />
        {/* idle時のみ半目まぶた */}
        {mood === 'idle' && (
          <rect x={cx - 9} y={EYE_Y - 9} width="18" height="9" rx="4" fill="#B0C898" />
        )}
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="14" ry="10" fill="#B0C898" />
      {/* 耳左 */}
      <circle cx="23" cy="36" r="9" fill="#A0B888" stroke="#80A060" strokeWidth="0.8" />
      {/* 耳右 */}
      <circle cx="77" cy="36" r="9" fill="#A0B888" stroke="#80A060" strokeWidth="0.8" />
      {/* 頭 */}
      <circle cx="50" cy="43" r="28" fill="#B0C898" stroke="#80A060" strokeWidth="1.2" />
      {/* 顔マスク */}
      <ellipse cx="50" cy="50" rx="19" ry="15" fill="#D0E0C0" />
      {/* 目の周りのダークリング */}
      <ellipse cx="39" cy="46" rx="11" ry="10" fill="#7A6040" opacity="0.4" />
      <ellipse cx="61" cy="46" rx="11" ry="10" fill="#7A6040" opacity="0.4" />
      {/* 目 */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="57" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="57" rx="8" ry="5" fill="#FFB7C5" opacity="0.6" />
      {/* 鼻 */}
      <ellipse cx="50" cy="57" rx="3" ry="2" fill="#7A9068" />
      {/* 口 */}
      {renderMouth()}
      {/* 爪（体の下にチラ見え） */}
      <path d="M43,86 L41,90" stroke="#80A060" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40,85 L37,89" stroke="#80A060" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M57,86 L59,90" stroke="#80A060" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60,85 L63,89" stroke="#80A060" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ── SVGキャラ: モモンガ ──
function MomongaSvg({ isBlinking, mood }: { isBlinking: boolean; mood: AiBuddyMood }) {
  const EYE_L = 37;
  const EYE_R = 63;
  const EYE_Y = 46;
  const EYE_W = 12;
  const PUPIL_R = 9;
  const HL_R = 3;
  const MOUTH_Y = 63;

  const renderEye = (cx: number) => {
    if (isBlinking) {
      return (
        <path
          d={`M ${cx - 10} ${EYE_Y} Q ${cx} ${EYE_Y + 7} ${cx + 10} ${EYE_Y}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    if (mood === 'happy') {
      return (
        <path
          d={`M ${cx - 11} ${EYE_Y + 2} Q ${cx} ${EYE_Y - 10} ${cx + 11} ${EYE_Y + 2}`}
          stroke="#2A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      );
    }
    return (
      <>
        <circle cx={cx} cy={EYE_Y} r={EYE_W} fill="white" stroke="#2A1A1A" strokeWidth="0.8" />
        <circle cx={cx} cy={EYE_Y} r={PUPIL_R} fill="#1A1A1A" />
        <circle cx={cx + 2.5} cy={EYE_Y - 2.5} r={HL_R} fill="white" />
      </>
    );
  };

  const renderMouth = () => {
    if (mood === 'happy') {
      return <path d={`M40,${MOUTH_Y} Q50,${MOUTH_Y + 10} 60,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="#FFB7C5" strokeLinecap="round" />;
    }
    if (mood === 'talking') {
      return <ellipse cx="50" cy={MOUTH_Y + 3} rx="5" ry="4" fill="#C06080" opacity="0.7" />;
    }
    if (mood === 'thinking') {
      return <path d={`M44,${MOUTH_Y + 2} Q47,${MOUTH_Y} 50,${MOUTH_Y + 2} Q53,${MOUTH_Y + 4} 56,${MOUTH_Y + 2}`} stroke="#C06080" strokeWidth="1.8" fill="none" />;
    }
    return <path d={`M46,${MOUTH_Y} Q50,${MOUTH_Y + 5} 54,${MOUTH_Y}`} stroke="#C06080" strokeWidth="2" fill="none" strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* 滑空膜左 */}
      <path d="M29,58 Q8,74 12,88 Q28,78 37,70 Z" fill="#C0B8E8" opacity="0.65" />
      {/* 滑空膜右 */}
      <path d="M71,58 Q92,74 88,88 Q72,78 63,70 Z" fill="#C0B8E8" opacity="0.65" />
      {/* 体 */}
      <ellipse cx="50" cy="82" rx="13" ry="9" fill="#D0C8F0" />
      {/* 耳左 */}
      <ellipse cx="27" cy="26" rx="6" ry="8" fill="#C0B8E8" stroke="#A0A0D0" strokeWidth="0.8" />
      {/* 耳右 */}
      <ellipse cx="73" cy="26" rx="6" ry="8" fill="#C0B8E8" stroke="#A0A0D0" strokeWidth="0.8" />
      {/* 頭 */}
      <circle cx="50" cy="44" r="28" fill="#D0C8F0" stroke="#A0A0D0" strokeWidth="1.2" />
      {/* 目（特大サイズ） */}
      {renderEye(EYE_L)}
      {renderEye(EYE_R)}
      {/* ほっぺ */}
      <ellipse cx="34" cy="60" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.6" />
      <ellipse cx="66" cy="60" rx="7" ry="4.5" fill="#FFB7C5" opacity="0.6" />
      {/* 鼻 */}
      <circle cx="50" cy="60" r="2" fill="#B0A8D8" />
      {/* 口 */}
      {renderMouth()}
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
        {character === 'bunny' && <BunnySvg isBlinking={isBlinking} mood={mood} />}

        {/* ── ゴリラ ── */}
        {character === 'gorilla' && <GorillaSvg isBlinking={isBlinking} mood={mood} />}

        {/* ── 猫 ── */}
        {character === 'cat' && <CatSvg isBlinking={isBlinking} mood={mood} />}

        {/* ── 犬 ── */}
        {character === 'dog' && <DogSvg isBlinking={isBlinking} mood={mood} />}

        {/* ── ナマケモノ ── */}
        {character === 'sloth' && <SlothSvg isBlinking={isBlinking} mood={mood} />}

        {/* ── モモンガ ── */}
        {character === 'momonga' && <MomongaSvg isBlinking={isBlinking} mood={mood} />}
      </div>
    </div>
  );
}
