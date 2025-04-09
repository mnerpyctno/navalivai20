import { Response } from 'express';
import logger from './logger';

export const handleMoySkladError = (error: any, res: Response) => {
  console.error('MoySklad API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      params: error.config?.params
    }
  });

  if (error.response) {
    if (error.response.status === 412) {
      const errorDetails = error.response.data?.errors?.[0];
      res.status(412).json({
        error: 'Ошибка предварительного условия',
        details: errorDetails?.error || 'Неизвестная ошибка',
        code: errorDetails?.code,
        moreInfo: errorDetails?.moreInfo,
        parameter: errorDetails?.parameter
      });
    } else {
      res.status(error.response.status).json({
        error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
        details: error.response.data?.errors?.[0]
      });
    }
  } else {
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
