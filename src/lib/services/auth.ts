import { telegramClient } from '../telegram/client';
import { usersRepository } from '../db/repositories/users';
import { ordersApi } from '../moysklad';
import { TelegramUser } from '../telegram/config';

export const authService = {
  async authenticateTelegramUser(telegramData: TelegramUser) {
    // Проверяем данные от Telegram
    const isValid = telegramClient.validateWebAppData({
      user: telegramData,
      auth_date: Math.floor(Date.now() / 1000),
      hash: '' // Хэш будет проверен в validateWebAppData
    });

    if (!isValid) {
      throw new Error('Invalid Telegram data');
    }

    // Создаем или обновляем пользователя
    const user = await usersRepository.upsertByTelegramId(
      telegramData.id.toString(),
      {
        telegramId: telegramData.id.toString(),
        name: `${telegramData.first_name} ${telegramData.last_name || ''}`.trim(),
        username: telegramData.username
      }
    );

    // Синхронизируем с МойСклад
    if (!user.moySkladId) {
      const moySkladCustomer = await ordersApi.createOrUpdateCustomer({
        id: user.id,
        name: user.name,
        phone: '', // Можно добавить поле в базу данных
        email: '' // Можно добавить поле в базу данных
      });

      // Обновляем пользователя с ID из МойСклад
      await usersRepository.update(user.id, {
        moySkladId: moySkladCustomer.id
      });
    }

    return user;
  }
}; 