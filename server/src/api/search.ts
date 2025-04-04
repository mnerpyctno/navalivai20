import express from 'express';
import axios from 'axios';
import { env } from '../config/env';

const router = express.Router();

// Создаем клиент для MoySklad API
const moySkladClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

router.get('/', async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    
    const filters = ['archived=false'];
    if (q) {
      filters.push(`name~=${q}`);
    }

    const response = await moySkladClient.get('/entity/product', {
      params: {
        expand: 'images,salePrices,productFolder,images.rows,images.rows.miniature,images.rows.tiny,images.rows.meta,images.rows.title,images.rows.type,images.rows.mediaType',
        filter: filters.join(';'),
        order: 'name,asc',
        limit,
        offset
      }
    });

    const products = response.data.rows.map((product: any) => {
      // Пробуем найти цену в следующем порядке:
      // 1. Цена продажи
      // 2. Первая доступная цена
      // 3. 0 если цен нет
      const retailPrice = product.salePrices?.find((price: { priceType?: { name: string } }) => 
        price.priceType?.name === 'Цена продажи' || 
        price.priceType?.name === 'Розничная цена' ||
        price.priceType?.name === 'Цена'
      ) || product.salePrices?.[0];

      // Если цена существует, делим на 100, иначе 0
      const price = retailPrice?.value ? retailPrice.value / 100 : 0;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: price,
        image: product.images?.rows?.[0]?.tiny?.href || product.images?.rows?.[0]?.miniature?.href || null,
        categoryId: product.categoryId || '',
        available: true,
        stock: 0
      };
    });

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.json({
      rows: products,
      meta: response.data.meta
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 