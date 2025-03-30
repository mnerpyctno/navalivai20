import { NextResponse } from 'next/server';
import { TELEGRAM_BOT_TOKEN, WEBAPP_URL } from '@/config/telegram';

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
    url: WEBAPP_URL
  }
};

export async function GET() {
  try {
    // Устанавливаем вебхук
    const webhookUrl = `${WEBAPP_URL}/api/telegram/webhook`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`);

    // Устанавливаем команды бота
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commands }),
    });

    // Устанавливаем меню бота
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ menu_button: menuButton }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error setting up bot:', error);
    return NextResponse.json({ ok: false, error: 'Failed to set up bot' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Обработка команды /start
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Добро пожаловать в магазин Наваливай! Нажмите кнопку "Открыть магазин" чтобы начать покупки.',
          reply_markup: {
            inline_keyboard: [[
              {
                text: 'Открыть магазин',
                web_app: { url: WEBAPP_URL }
              }
            ]]
          }
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing update:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process update' }, { status: 500 });
  }
} 