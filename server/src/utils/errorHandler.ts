import { Response } from 'express';
import logger from './logger';

export const handleMoySkladError = (error: any, res: Response) => {
  logger.error('MoySklad API Error:', {
    error: error.message,
    response: error.response?.data,
    status: error.response?.status,
    stack: error.stack
  });

  if (error.response) {
    res.status(error.response.status).json({
      error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
    });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
