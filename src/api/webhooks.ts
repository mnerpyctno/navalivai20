import { moySkladClient } from './config';
import { MoySkladWebhook, MoySkladStock } from '@/lib/types';
import { stockStore } from '@/lib/stockStore';

export const webhooksApi = {
  /**
   * Создание вебхука для отслеживания изменений остатков
   */
  async createStockWebhook(url: string): Promise<MoySkladWebhook> {
    const response = await moySkladClient.post('webhook', {
      url,
      action: 'CREATE',
      entityType: 'reportstockbystore',
      method: 'POST',
      enabled: true
    });

    return response.data;
  },

  /**
   * Получение списка активных вебхуков
   */
  async getWebhooks(): Promise<MoySkladWebhook[]> {
    const response = await moySkladClient.get('webhook');
    return response.data.rows;
  },

  /**
   * Удаление вебхука
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await moySkladClient.delete(`webhook/${webhookId}`);
  },

  /**
   * Обработка входящего вебхука с данными об остатках
   */
  async handleStockWebhook(data: any): Promise<void> {
    if (data.rows && Array.isArray(data.rows)) {
      data.rows.forEach((stock: MoySkladStock) => {
        stockStore.updateStockFromWebhook(stock);
      });
    }
  }
}; 