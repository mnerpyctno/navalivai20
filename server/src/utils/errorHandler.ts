import { Response } from 'express';
<<<<<<< HEAD
import logger from './logger';

export const handleMoySkladError = (error: any, res: Response) => {
  logger.error('MoySklad API Error:', {
    error: error.message,
    response: error.response?.data,
    status: error.response?.status,
    stack: error.stack
=======

export function handleMoySkladError(error: any, res: Response) {
  console.error('MoySklad API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    statusText: error.response?.statusText,
    config: {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      headers: {
        ...error.config?.headers,
        Authorization: 'Bearer [REDACTED]' // Скрываем токен в логах
      }
    },
    stack: error.stack,
    timestamp: new Date().toISOString()
>>>>>>> 403f6ea (Last version)
  });

  if (error.response) {
    // Ошибка от API МойСклад
    res.status(error.response.status).json({
      error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
<<<<<<< HEAD
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
=======
      details: error.response.data,
      timestamp: new Date().toISOString()
    });
  } else if (error.request) {
    // Ошибка при отправке запроса
    console.error('Request error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Ошибка при отправке запроса к API МойСклад',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } else {
    // Другая ошибка
    console.error('Internal error details:', {
      message: error.message,
>>>>>>> 403f6ea (Last version)
      stack: error.stack
    });
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
<<<<<<< HEAD
      details: error.message
    });
  }
}; 
=======
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 
>>>>>>> 403f6ea (Last version)
