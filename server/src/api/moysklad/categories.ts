import { Router } from 'express';
import { moySkladClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';

const router = Router();

// Получение списка категорий
router.get('/', async (req, res) => {
  try {
    const response = await moySkladClient.get('/entity/productfolder');
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await moySkladClient.get(`/entity/productfolder/${id}`);
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router; 