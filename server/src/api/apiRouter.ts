import { Router } from 'express';
import productsRouter from './products';
import categoriesRouter from './categories';
import imageRouter from './moysklad/image';
import searchRouter from './search';
import stockRouter from './stock';
import cartRouter from './cart';

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

router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/moysklad/image', imageRouter);
router.use('/search', searchRouter);
router.use('/stock', stockRouter);
router.use('/cart', cartRouter);

export default router; 