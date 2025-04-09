import { Response } from 'express';
import logger from './logger';

export const handleMoySkladError = (error: any, res: Response) => {
  console.error('MoySklad API Error:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
  });

  if (error.response) {
    if (error.response.status === 412) {
      res.status(412).json({
        error: 'Ошибка предварительного условия. Пожалуйста, проверьте заголовки запроса и повторите попытку.',
        details: error.response.data?.errors?.[0]?.error
      });
    } else {
      res.status(error.response.status).json({
        error: error.response.data?.errors?.[0]?.error || 'Ошибка при обращении к API МойСклад',
      });
    }
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
