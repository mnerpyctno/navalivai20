import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private static instance: ApiClient;
  public client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params });
  }

  public async post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data);
  }

  public async put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data);
  }

  public async delete<T>(url: string) {
    return this.client.delete<T>(url);
  }
}

export const apiClient = ApiClient.getInstance(); 