import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { MOYSKLAD_CONFIG, MoySkladParams } from './config';
import { handleMoySkladError } from './errors';

class MoySkladClient {
  private static instance: MoySkladClient;
  private client: AxiosInstance;

  private constructor() {
    this.client = axios.create({
      baseURL: MOYSKLAD_CONFIG.baseUrl,
      timeout: MOYSKLAD_CONFIG.timeout,
      headers: {
        ...MOYSKLAD_CONFIG.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        return handleMoySkladError(error);
      }
    );
  }

  public static getInstance(): MoySkladClient {
    if (!MoySkladClient.instance) {
      MoySkladClient.instance = new MoySkladClient();
    }
    return MoySkladClient.instance;
  }

  public async request<T>(config: any): Promise<T> {
    return this.client.request(config);
  }

  public async get<T>(path: string, params?: any): Promise<T> {
    const response = await this.client.get(path, { params });
    return response.data;
  }

  public async post<T>(path: string, data?: any, params?: any): Promise<T> {
    const response = await this.client.post(path, data, { params });
    return response.data;
  }

  public async delete<T>(path: string, params?: any): Promise<T> {
    const response = await this.client.delete(path, { params });
    return response.data;
  }

  public async put<T>(path: string, data?: any, params?: any): Promise<T> {
    const response = await this.client.put(path, data, { params });
    return response.data;
  }

  public getBaseUrl(): string {
    return MOYSKLAD_CONFIG.baseUrl;
  }
}

export const moySkladClient = MoySkladClient.getInstance(); 