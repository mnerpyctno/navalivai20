import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { MoySkladAPI } from '@/lib/moysklad';

const router = Router();
const prisma = new PrismaClient();

router.post('/telegram/register', async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, photoUrl } = req.body;

    if (!telegramId || !firstName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        telegramId,
        firstName,
        lastName,
        username,
        photoUrl,
        authDate: new Date(),
      },
    });

    // Регистрируем пользователя в МойСклад
    const moySkladApi = MoySkladAPI.getInstance();
    await moySkladApi.upsertCustomer(user.id, {
      first_name: firstName,
      last_name: lastName,
      username,
      photo_url: photoUrl,
    });

    return res.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 