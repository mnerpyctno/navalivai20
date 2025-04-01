import { PrismaClient } from '@prisma/client';

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
  private baseUrl: string;

  private constructor() {
    this.token = process.env.MOYSKLAD_API_TOKEN || '';
    this.baseUrl = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';
  }

  public static getInstance(): MoySkladAPI {
    if (!MoySkladAPI.instance) {
      MoySkladAPI.instance = new MoySkladAPI();
    }
    return MoySkladAPI.instance;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`MoySklad API error: ${response.statusText}`);
    }

    return response.json();
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
    const customer = await this.fetch<MoySkladCustomer>('/entity/counterparty', {
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
    return this.fetch<MoySkladCustomer>(`/entity/counterparty/${customerId}`, {
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
      `/entity/customerorder?filter=customer=${user.moySkladId}`
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

    const order = await this.fetch<MoySkladOrder>('/entity/customerorder', {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          meta: {
            href: `${this.baseUrl}/entity/counterparty/${user.moySkladId}`,
            type: 'entity.counterparty',
          },
        },
        positions: items.map(item => ({
          quantity: item.quantity,
          assortment: {
            meta: {
              href: `${this.baseUrl}/entity/product/${item.productId}`,
              type: 'entity.product',
            },
          },
        })),
      }),
    });

    // Создаем запись о заказе в базе данных
    await prisma.order.create({
      data: {
        userId,
        moySkladId: order.id,
        status: order.state.name,
        totalAmount: order.sum / 100, // Сумма в копейках
      },
    });

    return order;
  }
} 