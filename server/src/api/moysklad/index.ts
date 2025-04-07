import { Router } from 'express';
<<<<<<< HEAD
import { moySkladClient } from '../../config/moysklad';
=======
import { moySkladClient } from '../../index';
>>>>>>> 403f6ea (Last version)
import imageRouter from './image';
import ordersRouter from './orders';
import categoriesRouter from './categories';

const router = Router();

<<<<<<< HEAD
// Подключаем все роуты МойСклад
=======
// Подключаем маршруты
>>>>>>> 403f6ea (Last version)
router.use('/image', imageRouter);
router.use('/orders', ordersRouter);
router.use('/categories', categoriesRouter);

// Получение информации о компании
router.get('/company', async (req, res) => {
  try {
    const response = await moySkladClient.get('entity/organization');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company info' });
  }
});

// Получение информации о складах
router.get('/warehouses', async (req, res) => {
  try {
    const response = await moySkladClient.get('entity/store');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

export default router; 