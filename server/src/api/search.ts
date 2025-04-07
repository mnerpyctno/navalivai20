import express from 'express';
import { moySkladClient } from '../config/moysklad';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q: query, limit = 24, offset = 0 } = req.query;
    console.log('Search request received:', { query, limit, offset });

    if (!query) {
      console.log('No search query provided');
      return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedQuery = encodeURIComponent(query as string);
    console.log('Encoded query:', encodedQuery);

    const requestParams: any = {
      expand: 'images,salePrices,productFolder',
      filter: `name~${encodedQuery}`,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: 'name,asc'
    };

    const response = await moySkladClient.get('/entity/product', { params: requestParams });

    if (!response.data || !response.data.rows) {
      console.error('Ошибка: Пустой ответ от API МойСклад для поиска.');
      return res.status(500).json({ error: 'Ошибка сервера при поиске продуктов' });
    }

    const products = response.data.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.salePrices?.[0]?.value / 100 || 0,
      imageUrl: product.images?.rows?.[0]?.miniature?.href || null,
    }));

    res.json({ rows: products, meta: response.data.meta });
  } catch (error) {
    console.error('Search error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: (error as any).response?.data,
      status: (error as any).response?.status,
    });
    res.status(500).json({ error: 'Ошибка сервера при поиске продуктов' });
  }
});

export default router;