'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser, saveUser, defaultUserData } from '@/lib/store';
import AiBuddy from '@/components/AiBuddy';

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [suffix, setSuffix] = useState<'くん' | 'ちゃん'>('ちゃん');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = loadUser();
    if (user && user.name) {
      router.replace('/');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('なまえをにゅうりょくしてね！');
      return;
    }
    if (name.trim().length > 10) {
      setError('なまえは10もじいないにしてね！');
      return;
    }
    setIsSubmitting(true);
    saveUser({
      ...defaultUserData,
      name: name.trim(),
      suffix,
      lastLogin: new Date().toISOString().split('T')[0],
      loginStreak: 1,
      stars: 10,
    });
    setTimeout(() => {
      router.replace('/');
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B8E6F8 100%)' }}>
        <div className="animate-hop">
          <AiBuddy size={80} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 py-10"
      style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B8E6F8 60%, #FFB7C5 100%)' }}
    >
      {/* 雲の装飾 */}
      <div className="fixed top-8 left-4 opacity-70 animate-float" style={{ fontSize: '3rem' }}>☁️</div>
      <div className="fixed top-16 right-6 opacity-50 animate-float" style={{ fontSize: '2rem', animationDelay: '1s' }}>☁️</div>
      <div className="fixed top-4 right-1/3 opacity-60 animate-float" style={{ fontSize: '2.5rem', animationDelay: '2s' }}>☁️</div>

      {/* メインカード */}
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6"
        style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
      >
        {/* キャラクター */}
        <div className="animate-hop">
          <AiBuddy size={100} />
        </div>

        {/* タイトル */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#4A4A4A' }}>ことばっち</h1>
          <p className="text-sm" style={{ color: '#888' }}>AIおともだちとことばをまなぼう！</p>
        </div>

        {/* 吹き出し */}
        <div
          className="relative rounded-3xl px-6 py-4 text-center w-full"
          style={{ backgroundColor: '#FFB7C5' }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '14px solid #FFB7C5' }}
          />
          <p className="font-bold text-lg" style={{ color: '#4A4A4A' }}>
            なまえをおしえてね！🐰
          </p>
        </div>

        {/* 名前入力 */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-bold" style={{ color: '#4A4A4A' }}>なまえ</label>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="ここにかいてね"
            maxLength={10}
            className="w-full rounded-full px-5 py-3 text-lg font-bold outline-none border-2 transition-all"
            style={{
              borderColor: name ? '#87CEEB' : '#E0E0E0',
              color: '#4A4A4A',
              backgroundColor: '#F8F8FF',
              fontSize: '1.1rem',
            }}
            inputMode="text"
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          />
          {error && (
            <p className="text-sm text-center font-bold" style={{ color: '#FF6B6B' }}>{error}</p>
          )}
        </div>

        {/* 性別選択 */}
        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-bold" style={{ color: '#4A4A4A' }}>よびかた</label>
          <div className="flex gap-4">
            {(['ちゃん', 'くん'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSuffix(s)}
                className="flex-1 rounded-full py-3 text-lg font-bold transition-all shadow-md"
                style={{
                  backgroundColor: suffix === s ? '#FFB7C5' : 'white',
                  color: suffix === s ? 'white' : '#4A4A4A',
                  border: `3px solid ${suffix === s ? '#FF9BB0' : '#E0E0E0'}`,
                  minHeight: '56px',
                  transform: suffix === s ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              >
                {s === 'ちゃん' ? '🎀 ちゃん' : '⭐ くん'}
              </button>
            ))}
          </div>
        </div>

        {/* プレビュー */}
        {name.trim() && (
          <div
            className="w-full rounded-3xl px-4 py-3 text-center"
            style={{ backgroundColor: '#F0FFF8', border: '2px dashed #98E4D6' }}
          >
            <p style={{ color: '#4A4A4A' }}>
              <span className="font-bold text-lg">{name.trim()}{suffix}</span>
              <span className="text-sm">、よろしくね！</span>
            </p>
          </div>
        )}

        {/* はじめるボタン */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full rounded-full py-4 text-xl font-bold shadow-lg transition-all active:scale-95"
          style={{
            background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #FFB7C5, #FF9BB0)',
            color: 'white',
            minHeight: '60px',
            boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(255,155,176,0.5)',
          }}
        >
          {isSubmitting ? '🐰 じゅんびちゅう...' : '🎉 はじめる！'}
        </button>
      </div>

      {/* 下部の装飾星 */}
      <div className="fixed bottom-8 left-6 text-2xl animate-sparkle">✨</div>
      <div className="fixed bottom-12 right-8 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>⭐</div>
      <div className="fixed bottom-4 right-1/3 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
    </div>
  );
}
