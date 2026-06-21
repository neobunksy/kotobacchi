'use client';

import { useState, useEffect } from 'react';
import { loadUser, saveUser, type UserData, type EquippedItems } from '@/lib/store';
import AiBuddy from '@/components/AiBuddy';
import StarCounter from '@/components/StarCounter';
import BackButton from '@/components/BackButton';

type KisekaeCategory = 'hat' | 'outfit' | 'accessory' | 'background';

type ShopItem = {
  id: string;
  label: string;
  emoji: string;
  cost: number;
  category: KisekaeCategory;
  free?: boolean;
};

const SHOP_ITEMS: ShopItem[] = [
  // 帽子
  { id: 'hat_none', label: 'なし', emoji: '🚫', cost: 0, category: 'hat', free: true },
  { id: 'hat_red', label: 'あかいぼうし', emoji: '🎩', cost: 0, category: 'hat', free: true },
  { id: 'hat_crown', label: 'おうかん', emoji: '👑', cost: 50, category: 'hat' },
  { id: 'hat_star', label: 'ほしのぼうし', emoji: '⭐', cost: 30, category: 'hat' },
  // 服
  { id: 'outfit_ribbon_blue', label: 'あおいリボン', emoji: '🎀', cost: 0, category: 'outfit', free: true },
  { id: 'outfit_dino', label: 'きょうりゅうきぐるみ', emoji: '🦕', cost: 80, category: 'outfit' },
  { id: 'outfit_space', label: 'うちゅうふく', emoji: '🚀', cost: 100, category: 'outfit' },
  // アクセサリー
  { id: 'acc_none', label: 'なし', emoji: '🚫', cost: 0, category: 'accessory', free: true },
  { id: 'acc_wings', label: 'てんしのはね', emoji: '👼', cost: 40, category: 'accessory' },
  { id: 'acc_glasses', label: 'にじいろメガネ', emoji: '🕶', cost: 60, category: 'accessory' },
  // 背景
  { id: 'bg_sky', label: 'あおぞら', emoji: '☀️', cost: 0, category: 'background', free: true },
  { id: 'bg_night', label: 'よぞら', emoji: '🌙', cost: 20, category: 'background' },
  { id: 'bg_flower', label: 'おはなばたけ', emoji: '🌸', cost: 50, category: 'background' },
];

const CATEGORY_LABELS: Record<KisekaeCategory, string> = {
  hat: '帽子',
  outfit: '服',
  accessory: 'アクセ',
  background: 'はいけい',
};

const BACKGROUND_STYLES: Record<string, string> = {
  bg_sky: 'linear-gradient(180deg, #87CEEB 0%, #B8E6F8 100%)',
  bg_night: 'linear-gradient(180deg, #1a1a3e 0%, #0d0d24 100%)',
  bg_flower: 'linear-gradient(180deg, #FFB7C5 0%, #FFE66D 100%)',
};

export default function KisekiaPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [category, setCategory] = useState<KisekaeCategory>('hat');
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [flashMsg, setFlashMsg] = useState('');

  useEffect(() => {
    const u = loadUser();
    setUser(u);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#C8B8E8' }}>
        <div className="animate-hop">
          <AiBuddy size={80} />
        </div>
      </div>
    );
  }

  const bgStyle = BACKGROUND_STYLES[user.equippedItems.background ?? 'bg_sky'] ?? BACKGROUND_STYLES['bg_sky'];

  const handleEquip = (item: ShopItem) => {
    if (!user.unlockedItems.includes(item.id)) {
      // 未解放 → 購入確認
      setConfirmItem(item);
      return;
    }
    // 解放済み → 即装着
    const newEquipped: EquippedItems = { ...user.equippedItems };
    newEquipped[item.category] = item.id === 'hat_none' || item.id === 'acc_none' ? null : item.id;
    const newUser = { ...user, equippedItems: newEquipped };
    setUser(newUser);
    saveUser(newUser);
    setFlashMsg(`${item.label}をつけたよ！`);
    setTimeout(() => setFlashMsg(''), 1500);
  };

  const handlePurchase = (item: ShopItem) => {
    if (!user) return;
    if (user.stars < item.cost) {
      setFlashMsg('ほしがたりないよ！');
      setConfirmItem(null);
      setTimeout(() => setFlashMsg(''), 2000);
      return;
    }
    const newUnlocked = [...user.unlockedItems, item.id];
    const newEquipped: EquippedItems = { ...user.equippedItems };
    newEquipped[item.category] = item.id === 'hat_none' || item.id === 'acc_none' ? null : item.id;
    const newUser = {
      ...user,
      stars: user.stars - item.cost,
      unlockedItems: newUnlocked,
      equippedItems: newEquipped,
    };
    setUser(newUser);
    saveUser(newUser);
    setConfirmItem(null);
    setFlashMsg(`${item.label}をゲット！`);
    setTimeout(() => setFlashMsg(''), 2000);
  };

  const categoryItems = SHOP_ITEMS.filter(i => i.category === category);

  const equippedHat = user.equippedItems.hat;
  const equippedOutfit = user.equippedItems.outfit;
  const equippedAccessory = user.equippedItems.accessory;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ background: bgStyle }}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 relative z-10">
        <BackButton href="/" />
        <StarCounter stars={user.stars} />
      </div>

      <h1 className="text-center text-2xl font-bold py-1 relative z-10" style={{ color: '#4A4A4A' }}>
        🎀 きせかえ
      </h1>

      {/* フラッシュメッセージ */}
      {flashMsg && (
        <div
          className="mx-4 rounded-3xl px-4 py-2 text-center mb-2 relative z-10 transition-all"
          style={{ backgroundColor: '#FFE66D', border: '2px solid rgba(255,255,255,0.7)' }}
        >
          <p className="font-bold" style={{ color: '#4A4A4A' }}>{flashMsg}</p>
        </div>
      )}

      {/* キャラクタープレビュー */}
      <div className="flex justify-center py-3 relative z-10">
        <div
          className="rounded-3xl p-4 shadow-lg"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '3px solid rgba(255,255,255,0.9)' }}
        >
          <AiBuddy
            size={120}
            hat={equippedHat}
            outfit={equippedOutfit}
            accessory={equippedAccessory}
          />
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="flex mx-4 gap-1 mb-3 relative z-10">
        {(Object.keys(CATEGORY_LABELS) as KisekaeCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="flex-1 rounded-full py-2 font-bold text-xs transition-all"
            style={{
              backgroundColor: category === cat ? '#4A4A4A' : 'rgba(255,255,255,0.85)',
              color: category === cat ? 'white' : '#4A4A4A',
              minHeight: '44px',
              transform: category === cat ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* アイテムグリッド */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {categoryItems.map(item => {
            const isUnlocked = user.unlockedItems.includes(item.id);
            const isEquipped =
              item.category === 'hat' ? user.equippedItems.hat === item.id
              : item.category === 'outfit' ? user.equippedItems.outfit === item.id
              : item.category === 'accessory' ? user.equippedItems.accessory === item.id
              : user.equippedItems.background === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleEquip(item)}
                className="rounded-3xl p-4 flex flex-col items-center gap-2 shadow-md transition-all active:scale-95"
                style={{
                  backgroundColor: isEquipped
                    ? '#FFE66D'
                    : isUnlocked
                    ? 'rgba(255,255,255,0.92)'
                    : 'rgba(200,200,200,0.7)',
                  border: isEquipped
                    ? '3px solid #FFD700'
                    : isUnlocked
                    ? '2px solid rgba(255,255,255,0.8)'
                    : '2px dashed rgba(180,180,180,0.8)',
                  minHeight: '110px',
                  opacity: !isUnlocked && user.stars < item.cost ? 0.75 : 1,
                }}
              >
                <span className="text-4xl">{item.emoji}</span>
                <span className="text-sm font-bold text-center" style={{ color: '#4A4A4A' }}>
                  {item.label}
                </span>
                {isEquipped && (
                  <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: '#FFD700', color: '#4A4A4A' }}>
                    そうちゃく中
                  </span>
                )}
                {!isUnlocked && (
                  <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ backgroundColor: '#FFB7C5', color: '#4A4A4A' }}>
                    ⭐ {item.cost}で かいほう！
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 購入確認モーダル */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="rounded-3xl p-6 mx-6 flex flex-col items-center gap-4 shadow-2xl"
            style={{ backgroundColor: 'white', maxWidth: '320px', width: '100%' }}
          >
            <span className="text-5xl">{confirmItem.emoji}</span>
            <p className="text-lg font-bold text-center" style={{ color: '#4A4A4A' }}>
              {confirmItem.label}
            </p>
            <p className="text-base font-bold" style={{ color: '#4A4A4A' }}>
              ⭐ {confirmItem.cost} つかう？
            </p>
            <p className="text-sm" style={{ color: '#888' }}>
              いまのほし：⭐ {user.stars}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmItem(null)}
                className="flex-1 rounded-full py-3 font-bold"
                style={{ backgroundColor: '#E0E0E0', color: '#4A4A4A', minHeight: '52px' }}
              >
                やめる
              </button>
              <button
                onClick={() => handlePurchase(confirmItem)}
                disabled={user.stars < confirmItem.cost}
                className="flex-1 rounded-full py-3 font-bold"
                style={{
                  backgroundColor: user.stars >= confirmItem.cost ? '#FFB7C5' : '#ccc',
                  color: 'white',
                  minHeight: '52px',
                }}
              >
                かう！
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
