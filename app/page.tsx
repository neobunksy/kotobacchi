'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser, updateLoginStreak, type UserData } from '@/lib/store';
import AiBuddy from '@/components/AiBuddy';
import StarCounter from '@/components/StarCounter';

const MESSAGES = [
  'いっしょにあそぼう！',
  'クイズする？',
  'こんにちは！',
  'ぴょんぴょん！',
  'なにしてるの？',
  'たのしいね！',
  'がんばろう！',
  'おうたうたお！',
];

type TimeOfDay = 'morning' | 'evening' | 'night';

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'morning';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

function getGreeting(name: string, suffix: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return `${name}${suffix}！おはよう！`;
  if (hour >= 10 && hour < 17) return `${name}${suffix}！こんにちは！`;
  if (hour >= 17 && hour < 21) return `${name}${suffix}！こんばんは！`;
  return `${name}${suffix}！おやすみ！`;
}

function getBackground(timeOfDay: TimeOfDay): string {
  if (timeOfDay === 'morning') {
    return 'linear-gradient(180deg, #87CEEB 0%, #B8E6F8 60%, #ffffff 100%)';
  }
  if (timeOfDay === 'evening') {
    return 'linear-gradient(180deg, #FFB347 0%, #FFB7C5 50%, #C8B8E8 100%)';
  }
  return 'linear-gradient(180deg, #1a1a3e 0%, #0d0d24 60%, #000010 100%)';
}

const MENU_ITEMS = [
  { emoji: '🔤', label: 'もじであそぶ', href: '/moji', bg: '#FFB7C5', shadow: 'rgba(255,183,197,0.5)' },
  { emoji: '🎵', label: 'おとであそぶ', href: '/oto', bg: '#98E4D6', shadow: 'rgba(152,228,214,0.5)' },
  { emoji: '💬', label: 'おはなし', href: '/hanashi', bg: '#C8B8E8', shadow: 'rgba(200,184,232,0.5)' },
  { emoji: '🎀', label: 'きせかえ', href: '/kisekae', bg: '#FFE66D', shadow: 'rgba(255,230,109,0.5)' },
];

function NightStars() {
  const [stars] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: 'white',
            animation: `starTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [showSpeechBubble, setShowSpeechBubble] = useState(true);

  useEffect(() => {
    const userData = loadUser();
    if (!userData || !userData.name) {
      router.replace('/setup');
      return;
    }
    updateLoginStreak();
    const updatedUser = loadUser();
    setUser(updatedUser);
    setTimeOfDay(getTimeOfDay());
    setIsLoading(false);
  }, [router]);

  const rotateMessage = useCallback(() => {
    setShowSpeechBubble(false);
    setTimeout(() => {
      setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      setShowSpeechBubble(true);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotateMessage, 3000);
    return () => clearInterval(interval);
  }, [rotateMessage]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#87CEEB' }}>
        <div className="animate-hop">
          <AiBuddy size={80} />
        </div>
      </div>
    );
  }

  const bg = getBackground(timeOfDay);
  const greeting = getGreeting(user.name, user.suffix);
  const textColor = timeOfDay === 'night' ? '#ffffff' : '#4A4A4A';
  const textShadow = timeOfDay === 'night' ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 4px rgba(255,255,255,0.8)';

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ background: bg }}>
      {timeOfDay === 'night' && <NightStars />}

      {timeOfDay !== 'night' && (
        <>
          <div className="fixed top-8 left-6 opacity-60 animate-float text-5xl pointer-events-none">☁️</div>
          <div className="fixed top-16 right-4 opacity-40 animate-float text-3xl pointer-events-none" style={{ animationDelay: '1.5s' }}>☁️</div>
          <div className="fixed top-6 right-1/3 opacity-50 animate-float text-4xl pointer-events-none" style={{ animationDelay: '0.8s' }}>☁️</div>
        </>
      )}

      {/* ヘッダー：ほし数 */}
      <div className="flex justify-end items-center px-4 pt-6 pb-2 relative z-10">
        <StarCounter stars={user.stars} />
      </div>

      {/* メインエリア */}
      <div className="flex flex-col items-center flex-1 px-4 pb-24 relative z-10">
        {/* キャラクター + 吹き出し */}
        <div className="flex flex-col items-center mt-2 mb-2">
          <div
            className="relative rounded-3xl px-5 py-3 mb-3 text-center transition-opacity duration-300"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              opacity: showSpeechBubble ? 1 : 0,
              maxWidth: '200px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <p className="font-bold text-base" style={{ color: '#4A4A4A' }}>{message}</p>
            <div
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '12px solid rgba(255,255,255,0.9)',
              }}
            />
          </div>

          <AiBuddy
            size={140}
            hat={user.equippedItems.hat}
            outfit={user.equippedItems.outfit}
            accessory={user.equippedItems.accessory}
            onClick={() => router.push('/hanashi')}
          />
        </div>

        {/* あいさつ */}
        <p
          className="text-xl font-bold text-center mb-6"
          style={{ color: textColor, textShadow }}
        >
          {greeting}
        </p>

        {/* メニューカード */}
        <div className="flex flex-col gap-3 w-4/5 max-w-xs">
          {MENU_ITEMS.map(item => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-4 rounded-3xl px-6 transition-all active:scale-95"
              style={{
                backgroundColor: item.bg,
                minHeight: '90px',
                boxShadow: `0 6px 20px ${item.shadow}`,
                border: '2px solid rgba(255,255,255,0.6)',
              }}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="text-xl font-bold" style={{ color: '#4A4A4A' }}>{item.label}</span>
              <span className="ml-auto text-2xl" style={{ color: 'rgba(74,74,74,0.4)' }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* ことりちゃん固定ボタン */}
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => router.push('/hanashi')}
        role="button"
        aria-label="ことりちゃんとおはなし"
      >
        <div
          className="rounded-full p-1 shadow-lg animate-gentlePulse"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '3px solid #FFB7C5' }}
        >
          <AiBuddy size={56} />
        </div>
      </div>
    </div>
  );
}
