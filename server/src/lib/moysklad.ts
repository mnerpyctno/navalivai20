import axios from 'axios';
import { Customer } from '@/types/moysklad';

export class MoySkladAPI {
  private static instance: MoySkladAPI;
  private readonly baseUrl = 'https://api.moysklad.ru/api/remap/1.2';
  private readonly token: string;

  private constructor() {
    this.token = process.env.MOYSKLAD_TOKEN || '';
    if (!this.token) {
      throw new Error('MOYSKLAD_TOKEN is not set');
    }
  }

  public static getInstance(): MoySkladAPI {
    if (!MoySkladAPI.instance) {
      MoySkladAPI.instance = new MoySkladAPI();
    }
    return MoySkladAPI.instance;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  public async upsertCustomer(userId: string, customerData: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      // Поиск существующего клиента
      const response = await axios.get(`${this.baseUrl}/entity/counterparty`, {
        headers: this.getHeaders(),
        params: {
          filter: `code=${userId}`,
        },
      });

      const existingCustomer = response.data.rows[0];

      if (existingCustomer) {
        // Обновление существующего клиента
        const updatedCustomer = await axios.put(
          `${this.baseUrl}/entity/counterparty/${existingCustomer.id}`,
          {
            ...existingCustomer,
            ...customerData,
          },
          {
            headers: this.getHeaders(),
          }
        );
        return updatedCustomer.data;
      } else {
        // Создание нового клиента
        const newCustomer = await axios.post(
          `${this.baseUrl}/entity/counterparty`,
          {
            ...customerData,
            code: userId,
          },
          {
            headers: this.getHeaders(),
          }
        );
        return newCustomer.data;
      }
    } catch (error) {
      console.error('Error in upsertCustomer:', error);
      throw error;
    }
  }
} 