import { Request, Response } from 'express';
import { TELEGRAM_CONFIG } from '../../config/telegram';
import { telegramClient } from '../../lib/telegram/client';

// Команды для бота
const commands = [
  {
    command: 'start',
    description: 'Открыть магазин'
  }
];

// Настройка меню бота
const menuButton = {
  type: 'web_app',
  text: 'Открыть магазин',
  web_app: {
    url: TELEGRAM_CONFIG.webAppUrl
  }
};

export async function setupWebhook(req: Request, res: Response) {
  try {
    // Устанавливаем вебхук
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/setWebhook?url=${TELEGRAM_CONFIG.webhookUrl}`);

    // Устанавливаем команды бота
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commands }),
    });

    // Устанавливаем меню бота
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ menu_button: menuButton }),
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error setting up bot:', error);
    res.status(500).json({ ok: false, error: 'Failed to set up bot' });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const update = req.body;

    // Обработка команды /start
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      
      await telegramClient.sendMessage({
        chat_id: chatId,
        text: 'Добро пожаловать в магазин Наваливай! Нажмите кнопку "Открыть магазин" чтобы начать покупки.',
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Открыть магазин',
              web_app: { url: TELEGRAM_CONFIG.webAppUrl }
            }
          ]]
        }
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error processing update:', error);
    res.status(500).json({ ok: false, error: 'Failed to process update' });
  }
} 