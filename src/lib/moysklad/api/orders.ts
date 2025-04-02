import { moyskladClient } from '../client';
import { MoySkladParams } from '../config';
import { MoySkladOrder, MoySkladResponse } from '@/types/product';

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  price?: number;
}

export interface CreateOrderData {
  customerId: string;
  positions: CreateOrderItem[];
  comment?: string;
}

export interface GetOrdersParams extends MoySkladParams {
  customerId?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const ordersApi = {
  async getOrders(params?: GetOrdersParams): Promise<MoySkladResponse<MoySkladOrder>> {
    const filter = [];
    
    if (params?.customerId) {
      filter.push(`agent=${params.customerId}`);
    }
    
    if (params?.state) {
      filter.push(`state.name=${params.state}`);
    }
    
    if (params?.dateFrom) {
      filter.push(`moment>=${params.dateFrom}`);
    }
    
    if (params?.dateTo) {
      filter.push(`moment<=${params.dateTo}`);
    }

    return moyskladClient.get<MoySkladResponse<MoySkladOrder>>('entity/customerorder', {
      ...params,
      filter: filter.length > 0 ? filter.join(';') : undefined
    });
  },

  async getOrderById(id: string): Promise<MoySkladOrder> {
    return moyskladClient.get<MoySkladOrder>(`entity/customerorder/${id}`);
  },

  async createOrder(data: CreateOrderData): Promise<MoySkladOrder> {
    const orderData = {
      agent: {
        meta: {
          href: `${moyskladClient.getBaseUrl()}/entity/counterparty/${data.customerId}`,
          type: 'counterparty'
        }
      },
      positions: data.positions.map(item => ({
        quantity: item.quantity,
        price: item.price ? item.price * 100 : 0, // Конвертируем в копейки
        assortment: {
          meta: {
            href: `${moyskladClient.getBaseUrl()}/entity/product/${item.productId}`,
            type: 'product'
          }
        }
      })),
      description: data.comment
    };

    return moyskladClient.post<MoySkladOrder>('entity/customerorder', orderData);
  },

  async updateOrderStatus(orderId: string, stateId: string): Promise<MoySkladOrder> {
    return moyskladClient.put<MoySkladOrder>(`entity/customerorder/${orderId}`, {
      state: {
        meta: {
          href: `${moyskladClient.getBaseUrl()}/entity/state/${stateId}`,
          type: 'state'
        }
      }
    });
  }
}; 