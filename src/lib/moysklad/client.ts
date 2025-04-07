import axios from 'axios';
import { apiClient } from '../api/client';
import { MOYSKLAD_CONFIG } from './config';
import { handleMoySkladError } from './errors';

const MOYSKLAD_API_URL = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';
const MOYSKLAD_TOKEN = process.env.MOYSKLAD_TOKEN;

if (!MOYSKLAD_TOKEN) {
  throw new Error('MOYSKLAD_TOKEN is not defined');
}

export const moySkladClient = axios.create({
  baseURL: MOYSKLAD_API_URL,
  headers: {
    'Authorization': `Bearer ${MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

class MoySkladClient {
  private static instance: MoySkladClient;

  private constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    apiClient.client.interceptors.response.use(
      response => response,
      error => {
        handleMoySkladError(error);
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): MoySkladClient {
    if (!MoySkladClient.instance) {
      MoySkladClient.instance = new MoySkladClient();
    }
    return MoySkladClient.instance;
  }

  public async get<T>(url: string, params?: any) {
    return apiClient.get<T>(url, params);
  }

  public async post<T>(url: string, data?: any) {
    return apiClient.post<T>(url, data);
  }

  public async put<T>(url: string, data?: any) {
    return apiClient.put<T>(url, data);
  }

  public async delete<T>(url: string) {
    return apiClient.delete<T>(url);
  }
}