import { moySkladClient } from '@/lib/moysklad/client';
import { handleMoySkladError } from '@/lib/errors';
import { cache, CACHE_KEYS } from '@/lib/cache';
import { env } from '@/config/env';

interface WebhookData {
  entityType: string;
  action: string;
  data: any;
}

export const webhooksApi = {
  /**
   * Обработка вебхука с данными об остатках
   */
  async handleStockWebhook(data: WebhookData): Promise<void> {
    try {
      // Проверяем тип данных
      if (data.entityType !== 'reportstockbystore') {
        console.warn('Неизвестный тип вебхука:', data.entityType);
        return;
      }

      // Очищаем кэш остатков
      cache.delete(CACHE_KEYS.STOCK());
      cache.delete(CACHE_KEYS.STOCK(data.data.productId));

      // Очищаем кэш товаров, так как они содержат информацию об остатках
      cache.delete(CACHE_KEYS.PRODUCTS());
      cache.delete(CACHE_KEYS.PRODUCT(data.data.productId));

      console.log('Кэш остатков и товаров очищен после вебхука');
    } catch (error) {
      console.error('Ошибка при обработке вебхука:', error);
      throw error;
    }
  },

  /**
   * Регистрация вебхука
   */
  async registerWebhook(url: string, events: string[]): Promise<void> {
    try {
      const response = await moySkladClient.post('', {
        params: {
          method: 'post',
          url: 'entity/webhook',
          params: JSON.stringify({
            url,
            events,
            enabled: true
          })
        }
      });

      console.log('Вебхук успешно зарегистрирован:', response.data);
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Удаление вебхука
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const response = await moySkladClient.delete('', {
        params: {
          method: 'delete',
          url: `entity/webhook/${webhookId}`,
          params: JSON.stringify({})
        }
      });

      console.log('Вебхук успешно удален:', response.data);
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Получение списка вебхуков
   */
  async getWebhooks(): Promise<any[]> {
    try {
      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: 'entity/webhook',
          params: JSON.stringify({})
        }
      });

      return response.data.rows || [];
    } catch (error) {
      handleMoySkladError(error);
    }
  }
}; 