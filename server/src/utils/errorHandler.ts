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
    // Ошибка от API МойСклад
    res.status(error.response.status).json({
      error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
      details: error.response.data
    });
  } else if (error.request) {
    // Ошибка сети
    logger.error('Network Error:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Ошибка сети при обращении к API МойСклад',
      details: error.message
    });
  } else {
    // Другая ошибка
    logger.error('Unexpected Error:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      details: error.message
    });
  }
}; 