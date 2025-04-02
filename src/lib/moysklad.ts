import { PrismaClient } from '@prisma/client';
import { moySkladClient, BASE_URL } from '@/api/config';
import { env } from '@/config/env';

const prisma = new PrismaClient();

interface MoySkladCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  externalCode?: string;
}

interface MoySkladOrder {
  id: string;
  name: string;
  sum: number;
  state: {
    name: string;
  };
  customer: {
    id: string;
  };
}

export class MoySkladAPI {
  private static instance: MoySkladAPI;
  private token: string;

  private constructor() {
    console.log('Инициализация MoySkladAPI');
    console.log('env.moySkladToken:', env.moySkladToken ? 'Установлен' : 'Не установлен');
    console.log('process.env.MOYSKLAD_TOKEN:', process.env.MOYSKLAD_TOKEN ? 'Установлен' : 'Не установлен');
    console.log('typeof window:', typeof window);
    
    if (typeof window !== 'undefined') {
      throw new Error('MoySkladAPI не может быть использован на клиентской стороне');
    }

    if (!env.moySkladToken) {
      console.error('Ошибка: MOYSKLAD_TOKEN не настроен');
      throw new Error('MOYSKLAD_TOKEN не настроен');
    }
    this.token = env.moySkladToken;
  }

  public static getInstance(): MoySkladAPI {
    if (!MoySkladAPI.instance) {
      MoySkladAPI.instance = new MoySkladAPI();
    }
    return MoySkladAPI.instance;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = new URL('proxy', window.location.origin);
      url.searchParams.append('method', options.method || 'GET');
      url.searchParams.append('url', endpoint);
      
      if (options.body) {
        url.searchParams.append('params', options.body as string);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching from MoySklad:', error);
      throw error;
    }
  }

  // Создание или обновление контрагента
  async upsertCustomer(userId: string, telegramUser: any): Promise<MoySkladCustomer> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Если у пользователя уже есть ID в МойСклад, обновляем контрагента
    if (user.moySkladId) {
      return this.updateCustomer(user.moySkladId, telegramUser);
    }

    // Создаем нового контрагента
    const customer = await this.fetch<MoySkladCustomer>(`entity/counterparty`, {
      method: 'POST',
      body: JSON.stringify({
        name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
        phone: telegramUser.phone,
        email: telegramUser.username ? `${telegramUser.username}@telegram.com` : undefined,
        externalCode: userId,
      }),
    });

    // Сохраняем ID контрагента в базе данных
    await prisma.user.update({
      where: { id: userId },
      data: { moySkladId: customer.id },
    });

    return customer;
  }

  // Обновление контрагента
  private async updateCustomer(customerId: string, telegramUser: any): Promise<MoySkladCustomer> {
    return this.fetch<MoySkladCustomer>(`entity/counterparty/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`,
        phone: telegramUser.phone,
        email: telegramUser.username ? `${telegramUser.username}@telegram.com` : undefined,
      }),
    });
  }

  // Получение заказов пользователя
  async getUserOrders(userId: string): Promise<MoySkladOrder[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.moySkladId) {
      return [];
    }

    const orders = await this.fetch<{ rows: MoySkladOrder[] }>(
      `entity/customerorder?filter=customer=${user.moySkladId}`
    );

    // Обновляем количество заказов в базе данных
    await prisma.user.update({
      where: { id: userId },
      data: { ordersCount: orders.rows.length },
    });

    return orders.rows;
  }

  // Создание заказа
  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<MoySkladOrder> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.moySkladId) {
      throw new Error('User not found or not linked to MoySklad');
    }

    const order = await this.fetch<MoySkladOrder>(`entity/customerorder`, {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          meta: {
            href: `entity/counterparty/${user.moySkladId}`,
            type: 'entity.counterparty',
          },
        },
        positions: items.map(item => ({
          quantity: item.quantity,
          assortment: {
            meta: {
              href: `entity/product/${item.productId}`,
              type: 'entity.product',
            },
          },
        })),
      }),
    });

    // Создаем запись о заказе в базе данных
    const dbOrder = await prisma.order.create({
      data: {
        userId,
        moySkladId: order.id,
        status: order.state.name,
        total: order.sum / 100, // Сумма в копейках
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0 // Добавим цену позже
          }))
        }
      },
    });

    return order;
  }
} 