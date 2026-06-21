'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadUser,
  saveUser,
  updateLoginStreak,
  getTodayCharacter,
  applyNeedsDecay,
  feedCharacter,
  playWithCharacter,
  restCharacter,
  checkNeedsReward,
  type UserData,
  type AiBuddyCharacter,
} from '@/lib/store';
import AiBuddy, { type AiBuddyMood } from '@/components/AiBuddy';
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

// ニーズメーター1本
function NeedsMeter({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  color: string;
}) {
  const isLow = value <= 40;
  const pct = Math.round(value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg w-6 text-center">{emoji}</span>
      <span className="text-xs font-bold w-10 shrink-0" style={{ color: '#4A4A4A' }}>{label}</span>
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.5)' }}
      >
        <div
          className={isLow ? 'animate-pulse' : ''}
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 9999,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <span className="text-xs w-8 text-right shrink-0" style={{ color: '#4A4A4A' }}>{pct}%</span>
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
  const [todayCharacter, setTodayCharacter] = useState<AiBuddyCharacter>('bunny');
  const [buddyMood, setBuddyMood] = useState<AiBuddyMood>('idle');
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    const userData = loadUser();
    if (!userData || !userData.name) {
      router.replace('/setup');
      return;
    }
    updateLoginStreak();
    const loaded = loadUser()!;
    // Needsの時間経過減少を適用
    const decayed = applyNeedsDecay(loaded.needs);
    loaded.needs = decayed;
    saveUser(loaded);
    setUser(loaded);
    setTimeOfDay(getTimeOfDay());
    setTodayCharacter(getTodayCharacter());
    setIsLoading(false);
  }, [router]);

  // 30秒ごとにNeedsを再計算
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const current = loadUser();
      if (!current) return;
      current.needs = applyNeedsDecay(current.needs);
      saveUser(current);
      setUser({ ...current });
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

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

  // アクション共通処理
  const handleAction = useCallback((actionFn: () => UserData | null) => {
    const updated = actionFn();
    if (!updated) return;
    // 報酬チェック
    const rewarded = checkNeedsReward(updated);
    setUser({ ...rewarded });
    // キャラを一時的に happy に
    setBuddyMood('happy');
    setTimeout(() => setBuddyMood('idle'), 500);
    // 満タン達成フラッシュ
    if (
      rewarded.needs.hunger >= 80 &&
      rewarded.needs.sleepy >= 80 &&
      rewarded.needs.mood >= 80
    ) {
      setFlashMessage('さいこうだよ！⭐⭐⭐');
      setTimeout(() => setFlashMessage(null), 2000);
    }
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#87CEEB' }}>
        <div className="animate-hop">
          <AiBuddy size={80} mood="idle" />
        </div>
      </div>
    );
  }

  const bg = getBackground(timeOfDay);
  const greeting = getGreeting(user.name, user.suffix);
  const textColor = timeOfDay === 'night' ? '#ffffff' : '#4A4A4A';
  const textShadow = timeOfDay === 'night' ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 4px rgba(255,255,255,0.8)';

  const needs = user.needs;

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

      {/* フラッシュメッセージ */}
      {flashMessage && (
        <div
          className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl px-6 py-4 text-center font-bold text-xl shadow-xl"
          style={{ backgroundColor: 'rgba(255,230,100,0.97)', color: '#4A3A00', pointerEvents: 'none' }}
        >
          {flashMessage}
        </div>
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
            character={todayCharacter}
            mood={buddyMood}
            hat={user.equippedItems.hat}
            outfit={user.equippedItems.outfit}
            accessory={user.equippedItems.accessory}
            onClick={() => router.push('/hanashi')}
          />
        </div>

        {/* ニーズメーター */}
        <div
          className="w-full max-w-xs rounded-2xl px-4 py-3 mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.55)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <div className="flex flex-col gap-2">
            <NeedsMeter emoji="🍙" label="おなか" value={needs.hunger} color="#FF9D5C" />
            <NeedsMeter emoji="😴" label="ねむい" value={needs.sleepy} color="#9B8ECF" />
            <NeedsMeter emoji="💕" label="きもち" value={needs.mood}   color="#FF8FAB" />
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 mb-4 w-full max-w-xs justify-center">
          <button
            onClick={() => handleAction(feedCharacter)}
            className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 active:scale-95 transition-transform"
            style={{ backgroundColor: 'rgba(255,157,92,0.85)', boxShadow: '0 3px 10px rgba(255,157,92,0.4)' }}
          >
            <span className="text-2xl">🍙</span>
            <span className="text-xs font-bold" style={{ color: '#4A2A00' }}>ごはん</span>
          </button>
          <button
            onClick={() => handleAction(restCharacter)}
            className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 active:scale-95 transition-transform"
            style={{ backgroundColor: 'rgba(155,142,207,0.85)', boxShadow: '0 3px 10px rgba(155,142,207,0.4)' }}
          >
            <span className="text-2xl">😴</span>
            <span className="text-xs font-bold" style={{ color: '#2A1A4A' }}>ねんね</span>
          </button>
          <button
            onClick={() => handleAction(playWithCharacter)}
            className="flex-1 flex flex-col items-center gap-1 rounded-2xl py-3 active:scale-95 transition-transform"
            style={{ backgroundColor: 'rgba(255,143,171,0.85)', boxShadow: '0 3px 10px rgba(255,143,171,0.4)' }}
          >
            <span className="text-2xl">🎮</span>
            <span className="text-xs font-bold" style={{ color: '#4A0A1A' }}>あそぶ</span>
          </button>
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
          <AiBuddy size={56} mood="idle" character={todayCharacter} />
        </div>
      </div>
    </div>
  );
}
