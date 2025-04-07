import { Response } from 'express';
import logger from './logger';

export const handleMoySkladError = (error: any, res: Response) => {
  console.error('MoySklad API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
  });

  if (error.response) {
    res.status(error.response.status).json({
      error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
