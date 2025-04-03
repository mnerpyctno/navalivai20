interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  public set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cache = Cache.getInstance();

// Ключи кэша
export const CACHE_KEYS = {
  PRODUCTS: (categoryId?: string, page: number = 1, limit: number = 9) => 
    `products:${categoryId || 'all'}:${page}:${limit}`,
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORIES: (parentId?: string) => `categories:${parentId || 'all'}`,
  CATEGORY: (id: string) => `category:${id}`,
  STOCK: (productId?: string) => `stock:${productId || 'all'}`,
  SEARCH: (query: string) => `search:${query}`,
  IMAGE: (url: string) => `image:${url}`
} as const;

// Функции для работы с кэшем
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 минут
        return data;
      }
      localStorage.removeItem(key);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

export async function cacheData<T>(key: string, data: T, ttlMinutes: number = 5): Promise<void> {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching data:', error);
  }
} 