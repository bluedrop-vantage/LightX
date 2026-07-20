export interface KeyValueStorage {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  list(prefix: string): string[];
}

class LocalStorageAdapter implements KeyValueStorage {
  get<T>(key: string): T | undefined {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // out of quota — silently drop for now
    }
  }
  remove(key: string): void {
    window.localStorage.removeItem(key);
  }
  list(prefix: string): string[] {
    const out: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(k);
    }
    return out;
  }
}

class MemoryStorage implements KeyValueStorage {
  private map = new Map<string, string>();
  get<T>(key: string): T | undefined {
    const raw = this.map.get(key);
    return raw === undefined ? undefined : (JSON.parse(raw) as T);
  }
  set<T>(key: string, value: T): void {
    this.map.set(key, JSON.stringify(value));
  }
  remove(key: string): void {
    this.map.delete(key);
  }
  list(prefix: string): string[] {
    return [...this.map.keys()].filter((k) => k.startsWith(prefix));
  }
}

export const storage: KeyValueStorage =
  typeof window !== 'undefined' && 'localStorage' in window
    ? new LocalStorageAdapter()
    : new MemoryStorage();
