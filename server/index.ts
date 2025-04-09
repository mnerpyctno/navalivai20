import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.status(200).send({ message: 'Server is running on Vercel!' });
  } catch (error) {
    console.error('Ошибка в серверной функции:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
}