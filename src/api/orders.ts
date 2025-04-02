import { moySkladClient, MoySkladParams, DEFAULT_PARAMS } from '@/config/moysklad';
import { handleMoySkladError } from '@/lib/errors';
import { MoySkladResponse, MoySkladOrder } from '@/types/product';

export interface GetOrdersParams extends MoySkladParams {
  userId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  /**
   * Получение списка заказов
   */
  async getOrders(params: GetOrdersParams = {}): Promise<MoySkladResponse<MoySkladOrder>> {
    try {
      const queryParams = {
        ...DEFAULT_PARAMS,
        ...params
      };

      // Добавляем фильтр по пользователю
      if (params.userId) {
        queryParams.filter = `${queryParams.filter};agent=${params.userId}`;
      }

      // Добавляем фильтр по статусу
      if (params.status) {
        queryParams.filter = `${queryParams.filter};state=${params.status}`;
      }

      // Добавляем фильтр по дате
      if (params.dateFrom) {
        queryParams.filter = `${queryParams.filter};created>=${params.dateFrom}`;
      }
      if (params.dateTo) {
        queryParams.filter = `${queryParams.filter};created<=${params.dateTo}`;
      }

      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: 'entity/customerorder',
          params: JSON.stringify(queryParams)
        }
      });

      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Получение заказа по ID
   */
  async getOrder(orderId: string): Promise<MoySkladOrder> {
    try {
      const response = await moySkladClient.get('', {
        params: {
          method: 'get',
          url: `entity/customerorder/${orderId}`,
          params: JSON.stringify({
            expand: 'positions,state,agent,organization'
          })
        }
      });
      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Создание заказа
   */
  async createOrder(data: {
    agent: string;
    organization: string;
    positions: Array<{
      quantity: number;
      price: number;
      product: {
        meta: {
          href: string;
        };
      };
    }>;
  }): Promise<MoySkladOrder> {
    try {
      const response = await moySkladClient.post('', {
        params: {
          method: 'post',
          url: 'entity/customerorder',
          params: JSON.stringify({
            ...data,
            vatEnabled: true,
            vatIncluded: true,
            vatSum: 0,
            sum: data.positions.reduce((sum, pos) => sum + pos.price * pos.quantity, 0)
          })
        }
      });
      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  },

  /**
   * Обновление статуса заказа
   */
  async updateOrderStatus(orderId: string, statusId: string): Promise<MoySkladOrder> {
    try {
      const response = await moySkladClient.post('', {
        params: {
          method: 'post',
          url: `entity/customerorder/${orderId}/state/${statusId}`,
          params: JSON.stringify({})
        }
      });
      return response.data;
    } catch (error) {
      handleMoySkladError(error);
    }
  }
}; 