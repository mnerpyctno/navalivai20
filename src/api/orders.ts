import { MoySkladResponse, MoySkladOrder } from '@/types/product';

export interface GetOrdersParams {
  userId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Определяем базовый URL API в зависимости от окружения
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Серверная сторона
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  }
  
  // Клиентская сторона
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment 
    ? 'http://localhost:3002'
    : ''; // В продакшене используем относительный путь, так как API находится в том же домене
};

export const ordersApi = {
  /**
   * Получение списка заказов
   */
  async getOrders(params: GetOrdersParams = {}): Promise<MoySkladResponse<MoySkladOrder>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.status) queryParams.append('status', params.status);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${getApiBaseUrl()}/api/orders?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Получение заказа по ID
   */
  async getOrder(orderId: string): Promise<MoySkladOrder> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
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
      const response = await fetch(`${getApiBaseUrl()}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Обновление статуса заказа
   */
  async updateOrderStatus(orderId: string, statusId: string): Promise<MoySkladOrder> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statusId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}; 