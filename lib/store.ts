export type EquippedItems = {
  hat: string | null;
  outfit: string | null;
  accessory: string | null;
  background: string | null;
};

export type Needs = {
  hunger: number;    // 0〜100（高いほど満腹）
  sleepy: number;    // 0〜100（高いほど元気）
  mood: number;      // 0〜100（高いほど機嫌よし）
  lastUpdated: number;          // Date.now()
  lastRewardDate: string | null; // YYYY-MM-DD
};

export type AiBuddyCharacter = 'bunny' | 'gorilla' | 'cat' | 'dog' | 'sloth' | 'momonga';

export type UserData = {
  name: string;
  suffix: 'くん' | 'ちゃん';
  stars: number;
  lastLogin: string | null; // ISO date string
  loginStreak: number;
  equippedItems: EquippedItems;
  unlockedItems: string[];
  needs: Needs;
};

const STORAGE_KEY = 'kotobacchi_user';
const CHAR_STORAGE_KEY = 'kotobacchi_today_char';
const SELECTED_CHAR_KEY = 'kotobacchi_selected_char';

const defaultEquippedItems: EquippedItems = {
  hat: null,
  outfit: null,
  accessory: null,
  background: 'bg_sky',
};

const defaultNeeds: Needs = {
  hunger: 80,
  sleepy: 80,
  mood: 80,
  lastUpdated: Date.now(),
  lastRewardDate: null,
};

export const defaultUserData: UserData = {
  name: '',
  suffix: 'ちゃん',
  stars: 0,
  lastLogin: null,
  loginStreak: 0,
  equippedItems: defaultEquippedItems,
  unlockedItems: ['hat_none', 'outfit_ribbon_blue', 'bg_sky'],
  needs: defaultNeeds,
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
    if (!parsed.needs) {
      parsed.needs = { ...defaultNeeds, lastUpdated: Date.now() };
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

// ── キャラクター選択ロジック ──

type CharSaveData = {
  character: AiBuddyCharacter;
  date: string; // YYYY-MM-DD
};

const CHARACTER_POOL: Record<string, AiBuddyCharacter[]> = {
  morning:   ['bunny', 'dog'],
  afternoon: ['cat', 'gorilla'],
  evening:   ['bunny', 'cat'],
  night:     ['sloth', 'momonga'],
  latenight: ['sloth', 'momonga'],
};

function getTimePeriod(): string {
  const hour = new Date().getHours();
  if (hour >= 6  && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  if (hour >= 20 && hour < 24) return 'night';
  return 'latenight';
}

export function setSelectedCharacter(char: AiBuddyCharacter | null): void {
  if (typeof window === 'undefined') return;
  if (char === null) {
    localStorage.removeItem(SELECTED_CHAR_KEY);
  } else {
    localStorage.setItem(SELECTED_CHAR_KEY, char);
  }
}

export function getSelectedCharacter(): AiBuddyCharacter | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SELECTED_CHAR_KEY);
  if (!raw) return null;
  return raw as AiBuddyCharacter;
}

export function getTodayCharacter(): AiBuddyCharacter {
  if (typeof window === 'undefined') return 'bunny';

  // ユーザーが手動選択したキャラを優先
  const selected = getSelectedCharacter();
  if (selected) return selected;

  const today = new Date().toISOString().split('T')[0];

  try {
    const raw = localStorage.getItem(CHAR_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as CharSaveData;
      if (saved.date === today) {
        return saved.character;
      }
    }
  } catch {
    // ignore
  }

  const period = getTimePeriod();
  const pool = CHARACTER_POOL[period];
  const character = pool[Math.floor(Math.random() * pool.length)];

  const saveData: CharSaveData = { character, date: today };
  localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(saveData));

  return character;
}

// ── Needs（お世話）ロジック ──

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applyNeedsDecay(needs: Needs): Needs {
  const now = Date.now();
  const elapsedHours = (now - needs.lastUpdated) / (1000 * 60 * 60);

  return {
    hunger:      clamp(needs.hunger - elapsedHours * 10, 0, 100),
    sleepy:      clamp(needs.sleepy - elapsedHours * 8,  0, 100),
    mood:        clamp(needs.mood   - elapsedHours * 5,  0, 100),
    lastUpdated: now,
    lastRewardDate: needs.lastRewardDate,
  };
}

export function feedCharacter(): UserData | null {
  const user = loadUser();
  if (!user) return null;
  user.needs.hunger = clamp(user.needs.hunger + 30, 0, 100);
  user.needs.mood   = clamp(user.needs.mood   + 5,  0, 100);
  saveUser(user);
  return user;
}

export function playWithCharacter(): UserData | null {
  const user = loadUser();
  if (!user) return null;
  user.needs.mood   = clamp(user.needs.mood   + 20, 0, 100);
  user.needs.hunger = clamp(user.needs.hunger - 5,  0, 100);
  saveUser(user);
  return user;
}

export function restCharacter(): UserData | null {
  const user = loadUser();
  if (!user) return null;
  user.needs.sleepy = clamp(user.needs.sleepy + 40, 0, 100);
  saveUser(user);
  return user;
}

export function checkNeedsReward(user: UserData): UserData {
  const today = new Date().toISOString().split('T')[0];
  const { hunger, sleepy, mood, lastRewardDate } = user.needs;

  if (hunger >= 80 && sleepy >= 80 && mood >= 80 && lastRewardDate !== today) {
    user.stars += 3;
    user.needs.lastRewardDate = today;
    saveUser(user);
  }

  return user;
}
