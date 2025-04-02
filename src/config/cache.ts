export const CACHE_KEYS = {
  PRODUCTS: (categoryId?: string) => `products${categoryId ? `:${categoryId}` : ''}`,
  CATEGORIES: 'categories',
  STOCK: 'stock',
  IMAGE: (url: string) => `image:${url}`,
} as const; 