/**
 * Steel Front: Tank Defense
 * Safe LocalStorage Storage System
 */

const STORAGE_KEYS = {
  UNLOCKED_LEVEL: 'steel_front_unlocked_level',
  HIGH_SCORE: 'steel_front_high_score',
  MUTED: 'steel_front_audio_muted',
  LANG: 'steel_front_lang',
  TOTAL_KILLS: 'steel_front_total_kills',
  TOTAL_VICTORIES: 'steel_front_total_victories'
};

export const Storage = {
  getUnlockedLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVEL);
      if (val) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 1 && num <= 6) return num;
      }
    } catch {
      // LocalStorage unavailable/disabled
    }
    return 1;
  },

  setUnlockedLevel(level: number): void {
    try {
      const current = Storage.getUnlockedLevel();
      if (level > current) {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVEL, String(Math.min(6, level)));
      }
    } catch {
      // Ignore
    }
  },

  getHighScore(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      if (val) {
        const num = parseInt(val, 10);
        if (!isNaN(num) && num >= 0) return num;
      }
    } catch {
      // Ignore
    }
    return 0;
  },

  setHighScore(score: number): void {
    try {
      const current = Storage.getHighScore();
      if (score > current) {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(score));
      }
    } catch {
      // Ignore
    }
  },

  isMuted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
    } catch {
      return false;
    }
  },

  setMuted(muted: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MUTED, String(muted));
    } catch {
      // Ignore
    }
  },

  getLanguage(): 'uz' | 'en' | 'ru' {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.LANG);
      if (val === 'uz' || val === 'en' || val === 'ru') return val;
    } catch {
      // Ignore
    }
    return 'en'; // Default to English as requested by user!
  },

  setLanguage(lang: 'uz' | 'en' | 'ru'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch {
      // Ignore
    }
  },

  getTotalKills(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.TOTAL_KILLS);
      if (val) {
        const num = parseInt(val, 10);
        if (!isNaN(num)) return num;
      }
    } catch {
      // Ignore
    }
    return 0;
  },

  addKills(count: number): void {
    try {
      const current = Storage.getTotalKills();
      localStorage.setItem(STORAGE_KEYS.TOTAL_KILLS, String(current + count));
    } catch {
      // Ignore
    }
  },

  getTotalVictories(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.TOTAL_VICTORIES);
      if (val) {
        const num = parseInt(val, 10);
        if (!isNaN(num)) return num;
      }
    } catch {
      // Ignore
    }
    return 0;
  },

  addVictory(): void {
    try {
      const current = Storage.getTotalVictories();
      localStorage.setItem(STORAGE_KEYS.TOTAL_VICTORIES, String(current + 1));
    } catch {
      // Ignore
    }
  }
};
