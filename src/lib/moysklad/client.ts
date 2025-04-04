import { apiClient } from '../api/client';
import { MOYSKLAD_CONFIG } from './config';
import { handleMoySkladError } from './errors';

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

export const moySkladClient = MoySkladClient.getInstance(); 