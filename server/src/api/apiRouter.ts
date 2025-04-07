import { Router } from 'express';
import productsRouter from './products';
import categoriesRouter from './categories';
import imageRouter from './moysklad/image';
import searchRouter from './search';
<<<<<<< HEAD
import stockRouter from './stock';
import cartRouter from './cart';
=======
>>>>>>> 403f6ea (Last version)

const router = Router();

router.use((req, res, next) => {
  console.log('API request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  next();
});

<<<<<<< HEAD
// Проверка работоспособности сервера
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/categories', async (_req, res) => {
  try {
    // Пример данных категорий
    const categories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' }
    ];
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

=======
>>>>>>> 403f6ea (Last version)
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/moysklad/image', imageRouter);
router.use('/search', searchRouter);
<<<<<<< HEAD
router.use('/stock', stockRouter);
router.use('/cart', cartRouter);

export default router;
=======

export default router; 
>>>>>>> 403f6ea (Last version)
