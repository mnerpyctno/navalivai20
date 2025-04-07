import { Router } from 'express';
import categoriesRouter from './categories';

const router = Router();

router.use('/categories', categoriesRouter); // Подключение маршрута

export default router;
