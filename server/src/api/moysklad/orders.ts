import { Router } from 'express';
import { moySkladClient } from '../../config/moysklad';
import { handleMoySkladError } from '../../utils/errorHandler';

const router = Router();

// Создание или обновление клиента
router.post('/customers', async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    // Сначала ищем существующего клиента
    const searchResponse = await moySkladClient.get('/entity/counterparty', {
      params: {
        filter: `phone=${phone}`
      }
    });

    if (searchResponse.data.rows.length > 0) {
      // Обновляем существующего клиента
      const customer = searchResponse.data.rows[0];
      const updateResponse = await moySkladClient.put(`/entity/counterparty/${customer.id}`, {
        name,
        phone,
        email
      });
      res.json(updateResponse.data);
    } else {
      // Создаем нового клиента
      const createResponse = await moySkladClient.post('/entity/counterparty', {
        name,
        phone,
        email
      });
      res.json(createResponse.data);
    }
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

// Создание заказа
router.post('/orders', async (req, res) => {
  try {
    const { customerId, positions, description } = req.body;
    
    const response = await moySkladClient.post('/entity/customerorder', {
      organization: {
        meta: {
          href: process.env.MOYSKLAD_ORGANIZATION_HREF,
          type: 'organization'
        }
      },
      agent: {
        meta: {
          href: `/entity/counterparty/${customerId}`,
          type: 'counterparty'
        }
      },
      positions,
      description
    });

    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

router.get('/', async (req, res) => {
  try {
    const response = await moySkladClient.get('/entity/customerorder');
    res.json(response.data);
  } catch (error) {
    handleMoySkladError(error, res);
  }
});

export default router; 