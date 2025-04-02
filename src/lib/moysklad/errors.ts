import { AxiosError } from 'axios';
import { MoySkladError } from './config';

export class MoySkladApiError extends Error {
  constructor(
    public status: number,
    public code: number,
    message: string,
    public moreInfo?: string
  ) {
    super(message);
    this.name = 'MoySkladApiError';
  }
}

export function handleMoySkladError(error: AxiosError): never {
  if (error.response) {
    const { status, data } = error.response;
    const moySkladError = data as MoySkladError;
    
    console.error('MoySklad API Error:', {
      status,
      code: moySkladError.code,
      message: moySkladError.error,
      moreInfo: moySkladError.moreInfo,
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      headers: {
        ...error.config?.headers,
        Authorization: '[REDACTED]'
      }
    });

    throw new MoySkladApiError(
      status,
      moySkladError.code,
      moySkladError.error,
      moySkladError.moreInfo
    );
  }

  if (error.request) {
    console.error('Network Error:', {
      request: error.request,
      config: error.config
    });
  } else {
    console.error('Request Error:', error.message);
  }

  throw error;
} 