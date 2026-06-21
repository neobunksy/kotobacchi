export type EquippedItems = {
  hat: string | null;
  outfit: string | null;
  accessory: string | null;
  background: string | null;
};

export type UserData = {
  name: string;
  suffix: 'くん' | 'ちゃん';
  stars: number;
  lastLogin: string | null; // ISO date string
  loginStreak: number;
  equippedItems: EquippedItems;
  unlockedItems: string[];
};

const STORAGE_KEY = 'kotobacchi_user';

const defaultEquippedItems: EquippedItems = {
  hat: null,
  outfit: null,
  accessory: null,
  background: 'bg_sky',
};

export const defaultUserData: UserData = {
  name: '',
  suffix: 'ちゃん',
  stars: 0,
  lastLogin: null,
  loginStreak: 0,
  equippedItems: defaultEquippedItems,
  unlockedItems: ['hat_none', 'outfit_ribbon_blue', 'bg_sky'],
};

export function loadUser(): UserData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserData;
    // unlockedItemsが存在しない古いデータの場合はデフォルトをマージ
    if (!parsed.unlockedItems) {
      parsed.unlockedItems = defaultUserData.unlockedItems;
    }
    if (!parsed.equippedItems) {
      parsed.equippedItems = defaultEquippedItems;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveUser(data: UserData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addStars(amount: number): UserData | null {
  const user = loadUser();
  if (!user) return null;
  user.stars = Math.max(0, user.stars + amount);
  saveUser(user);
  return user;
}

export function spendStars(amount: number): boolean {
  const user = loadUser();
  if (!user) return false;
  if (user.stars < amount) return false;
  user.stars -= amount;
  saveUser(user);
  return true;
}

export function unlockItem(itemId: string): void {
  const user = loadUser();
  if (!user) return;
  if (!user.unlockedItems.includes(itemId)) {
    user.unlockedItems.push(itemId);
    saveUser(user);
  }
}

export function equipItem(category: keyof EquippedItems, itemId: string | null): void {
  const user = loadUser();
  if (!user) return;
  user.equippedItems[category] = itemId;
  saveUser(user);
}

export function updateLoginStreak(): void {
  const user = loadUser();
  if (!user) return;
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (user.lastLogin === null) {
    user.loginStreak = 1;
    user.lastLogin = today;
    user.stars += 5;
    saveUser(user);
    return;
  }

  const lastDate = new Date(user.lastLogin);
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // 同日：何もしない
    return;
  } else if (diffDays === 1) {
    // 連続ログイン
    user.loginStreak += 1;
  } else {
    // ストリーク途切れ
    user.loginStreak = 1;
  }

  user.lastLogin = today;
  user.stars += 5 + Math.min(user.loginStreak, 10); // 最大15ほし
  saveUser(user);
}
