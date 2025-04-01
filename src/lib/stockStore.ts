import { MoySkladStock } from './types';

class StockStore {
  private static instance: StockStore;
  private stockCache: Map<string, number> = new Map();
  private isInitialized: boolean = false;
  private subscribers: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): StockStore {
    if (!StockStore.instance) {
      StockStore.instance = new StockStore();
    }
    return StockStore.instance;
  }

  /**
   * Извлечение ID товара из объекта
   */
  private extractProductId(stock: MoySkladStock): string | null {
    // Проверяем наличие прямого ID
    if (stock.product?.id) {
      return stock.product.id;
    }

    // Если нет прямого ID, пытаемся извлечь из URL
    if (!stock.product?.meta?.href) {
      return null;
    }

    const matches = stock.product.meta.href.match(/\/product\/([^?]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }

    return null;
  }

  /**
   * Обновление остатков из вебхука
   */
  updateStockFromWebhook(stockData: MoySkladStock): void {
    const productId = this.extractProductId(stockData);
    if (productId) {
      this.stockCache.set(productId, stockData.quantity);
      this.isInitialized = true;
      this.notifySubscribers();
    } else {
      console.warn('Не удалось получить ID товара из вебхука:', stockData);
    }
  }

  /**
   * Получение остатка по ID товара
   */
  getStock(productId: string): number {
    if (!this.isInitialized) {
      console.warn('StockStore не инициализирован');
      return 0;
    }
    return this.stockCache.get(productId) ?? 0;
  }

  /**
   * Получение всех остатков
   */
  getAllStock(): Map<string, number> {
    if (!this.isInitialized) {
      console.warn('StockStore не инициализирован');
      return new Map();
    }
    return this.stockCache;
  }

  /**
   * Обновление всех остатков
   */
  updateAllStock(stocks: MoySkladStock[]): void {
    this.stockCache.clear();
    
    stocks.forEach(stock => {
      const productId = this.extractProductId(stock);
      if (productId) {
        this.stockCache.set(productId, stock.quantity);
      } else {
        console.warn('Пропущен товар без ID:', stock);
      }
    });
    
    this.isInitialized = true;
    this.notifySubscribers();
  }

  /**
   * Проверка инициализации данных
   */
  isDataInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Подписка на обновления остатков
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Уведомление подписчиков об обновлении
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }
}

export const stockStore = StockStore.getInstance(); 