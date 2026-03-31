type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

const now = (): number => Date.now();

export const getCache = <T>(key: string): T | undefined => {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= now()) {
    store.delete(key);
    return undefined;
  }

  return entry.value as T;
};

export const setCache = <T>(key: string, value: T, ttlMs: number): void => {
  store.set(key, { value, expiresAt: now() + ttlMs });
};

export const getOrSetCache = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T> | T
): Promise<T> => {
  const cached = getCache<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const value = await loader();
  setCache(key, value, ttlMs);
  return value;
};

export const clearCache = (key: string): void => {
  store.delete(key);
};

export const clearCacheByPrefix = (prefix: string): void => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};
