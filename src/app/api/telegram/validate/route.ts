import { NextResponse } from 'next/server';
import { TELEGRAM_SECRET_KEY } from '@/config/telegram';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { initData } = data;

    if (!initData) {
      return NextResponse.json({ ok: false, error: 'No init data provided' }, { status: 400 });
    }

    // Разбираем строку initData
    const searchParams = new URLSearchParams(initData);
    const hash = searchParams.get('hash');
    searchParams.delete('hash');

    // Сортируем оставшиеся параметры
    const params = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем HMAC-SHA256
    const hmac = crypto.createHmac('sha256', TELEGRAM_SECRET_KEY);
    hmac.update(params);
    const calculatedHash = hmac.digest('hex');

    // Сравниваем хеши
    if (calculatedHash === hash) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid hash' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return NextResponse.json({ ok: false, error: 'Validation failed' }, { status: 500 });
  }
} 