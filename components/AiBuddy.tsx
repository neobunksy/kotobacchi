'use client';

import { useState, useEffect } from 'react';

type AiBuddyProps = {
  size?: number;
  hat?: string | null;
  outfit?: string | null;
  accessory?: string | null;
  className?: string;
  onClick?: () => void;
};

export default function AiBuddy({
  size = 120,
  hat = null,
  outfit = null,
  accessory = null,
  className = '',
  onClick,
}: AiBuddyProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [hopOffset, setHopOffset] = useState(0);
  const [earAngle, setEarAngle] = useState(0);

  useEffect(() => {
    // まばたき：4〜7秒おきにランダムで発生
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 3000 + Math.random() * 2000);

    // ぴょんぴょん：1.5秒周期
    let hopDir = -1;
    const hopInterval = setInterval(() => {
      setHopOffset(prev => {
        if (prev <= -10) hopDir = 1;
        if (prev >= 0) hopDir = -1;
        return prev + hopDir * 2;
      });
    }, 50);

    // 耳ゆれ：2秒周期
    let earDir = -1;
    const earInterval = setInterval(() => {
      setEarAngle(prev => {
        if (prev <= -5) earDir = 1;
        if (prev >= 5) earDir = -1;
        return prev + earDir * 1;
      });
    }, 50);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(hopInterval);
      clearInterval(earInterval);
    };
  }, []);

  const eyeScaleY = isBlinking ? 0.05 : 1;
  const bodyColor = outfit === 'outfit_dino' ? '#90EE90' : outfit === 'outfit_space' ? '#B0C4DE' : '#FFF5E1';
  const ribbonColor = '#FFB7C5';

  return (
    <div
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size + 20 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'ことりちゃんをタップ' : undefined}
    >
      <svg
        width={size}
        height={size + 20}
        viewBox="0 0 120 140"
        style={{ transform: `translateY(${hopOffset}px)`, transition: 'transform 0.05s linear' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 左耳 */}
        <ellipse
          cx="40"
          cy="28"
          rx="12"
          ry="28"
          fill={bodyColor}
          stroke="#E8D8C0"
          strokeWidth="2"
          style={{
            transformOrigin: '40px 50px',
            transform: `rotate(${earAngle - 5}deg)`,
          }}
        />
        {/* 左耳内側（ピンク） */}
        <ellipse
          cx="40"
          cy="28"
          rx="7"
          ry="20"
          fill="#FFB7C5"
          style={{
            transformOrigin: '40px 50px',
            transform: `rotate(${earAngle - 5}deg)`,
          }}
        />

        {/* 右耳 */}
        <ellipse
          cx="80"
          cy="28"
          rx="12"
          ry="28"
          fill={bodyColor}
          stroke="#E8D8C0"
          strokeWidth="2"
          style={{
            transformOrigin: '80px 50px',
            transform: `rotate(${earAngle + 5}deg)`,
          }}
        />
        {/* 右耳内側（ピンク） */}
        <ellipse
          cx="80"
          cy="28"
          rx="7"
          ry="20"
          fill="#FFB7C5"
          style={{
            transformOrigin: '80px 50px',
            transform: `rotate(${earAngle + 5}deg)`,
          }}
        />

        {/* 胴体 */}
        <ellipse cx="60" cy="100" rx="38" ry="35" fill={bodyColor} stroke="#E8D8C0" strokeWidth="2" />

        {/* 頭 */}
        <circle cx="60" cy="62" r="32" fill={bodyColor} stroke="#E8D8C0" strokeWidth="2" />

        {/* 左目 */}
        <ellipse
          cx="47"
          cy="60"
          rx="7"
          ry={7 * eyeScaleY}
          fill="#4A4A4A"
          style={{ transformOrigin: '47px 60px' }}
        />
        {/* 左目ハイライト */}
        <circle cx="50" cy="57" r="2.5" fill="white" style={{ opacity: isBlinking ? 0 : 1 }} />

        {/* 右目 */}
        <ellipse
          cx="73"
          cy="60"
          rx="7"
          ry={7 * eyeScaleY}
          fill="#4A4A4A"
          style={{ transformOrigin: '73px 60px' }}
        />
        {/* 右目ハイライト */}
        <circle cx="76" cy="57" r="2.5" fill="white" style={{ opacity: isBlinking ? 0 : 1 }} />

        {/* 鼻 */}
        <ellipse cx="60" cy="70" rx="4" ry="3" fill="#FFB7C5" />

        {/* 口 */}
        <path d="M54 75 Q60 80 66 75" stroke="#E0A0A8" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 左ほっぺ */}
        <ellipse cx="35" cy="70" rx="10" ry="7" fill="#FFB7C5" opacity="0.6" />
        {/* 右ほっぺ */}
        <ellipse cx="85" cy="70" rx="10" ry="7" fill="#FFB7C5" opacity="0.6" />

        {/* リボン（服：デフォルト） */}
        {(outfit === null || outfit === 'outfit_ribbon_blue') && (
          <g>
            <path d="M50 90 L40 82 L50 86 Z" fill={ribbonColor} />
            <path d="M70 90 L80 82 L70 86 Z" fill={ribbonColor} />
            <circle cx="60" cy="88" r="5" fill={ribbonColor} />
          </g>
        )}

        {/* 恐竜着ぐるみの棘 */}
        {outfit === 'outfit_dino' && (
          <g fill="#5DBF5D">
            <polygon points="45,72 48,60 51,72" />
            <polygon points="55,68 58,56 61,68" />
            <polygon points="65,68 68,56 71,68" />
          </g>
        )}

        {/* 宇宙服のヘルメット縁 */}
        {outfit === 'outfit_space' && (
          <circle cx="60" cy="62" r="35" fill="none" stroke="#A0B4CC" strokeWidth="4" strokeDasharray="4 2" />
        )}

        {/* 帽子 */}
        {hat === 'hat_red' && (
          <g>
            <rect x="30" y="28" width="60" height="12" rx="4" fill="#FF6B6B" />
            <rect x="38" y="16" width="44" height="16" rx="6" fill="#FF6B6B" />
          </g>
        )}
        {hat === 'hat_crown' && (
          <g>
            <path d="M35 40 L35 28 L45 35 L60 22 L75 35 L85 28 L85 40 Z" fill="#FFE66D" stroke="#FFD700" strokeWidth="1.5" />
            <circle cx="60" cy="25" r="4" fill="#FF6B6B" />
            <circle cx="45" cy="35" r="3" fill="#87CEEB" />
            <circle cx="75" cy="35" r="3" fill="#98E4D6" />
          </g>
        )}
        {hat === 'hat_star' && (
          <g>
            <polygon points="60,18 64,28 75,28 66,34 69,45 60,39 51,45 54,34 45,28 56,28" fill="#FFE66D" stroke="#FFD700" strokeWidth="1" />
          </g>
        )}

        {/* アクセサリー */}
        {accessory === 'acc_wings' && (
          <g opacity="0.85">
            <path d="M22 88 Q8 72 18 60 Q26 72 30 85 Z" fill="white" stroke="#E0E0FF" strokeWidth="1" />
            <path d="M98 88 Q112 72 102 60 Q94 72 90 85 Z" fill="white" stroke="#E0E0FF" strokeWidth="1" />
          </g>
        )}
        {accessory === 'acc_glasses' && (
          <g>
            <circle cx="47" cy="62" r="11" fill="none" stroke="#FFB347" strokeWidth="3" />
            <circle cx="73" cy="62" r="11" fill="none" stroke="#98E4D6" strokeWidth="3" />
            <line x1="58" y1="62" x2="62" y2="62" stroke="#4A4A4A" strokeWidth="2" />
            <line x1="36" y1="62" x2="30" y2="60" stroke="#4A4A4A" strokeWidth="2" />
            <line x1="84" y1="62" x2="90" y2="60" stroke="#4A4A4A" strokeWidth="2" />
          </g>
        )}

        {/* しっぽ */}
        <ellipse cx="60" cy="132" rx="14" ry="8" fill={bodyColor} stroke="#E8D8C0" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
