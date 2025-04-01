import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  const data = searchParams.toString().split('&').filter(param => param !== `hash=${hash}`).join('&');
  
  if (!hash || !BOT_TOKEN) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Проверяем подпись данных
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedHash = hmac.update(data).digest('hex');

  if (calculatedHash !== hash) {
    return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
  }

  // Получаем данные пользователя
  const user = {
    id: searchParams.get('id'),
    first_name: searchParams.get('first_name'),
    last_name: searchParams.get('last_name'),
    username: searchParams.get('username'),
    photo_url: searchParams.get('photo_url'),
    auth_date: searchParams.get('auth_date'),
  };

  // Здесь вы можете сохранить данные пользователя в вашей базе данных
  // и создать сессию или JWT токен

  // Перенаправляем пользователя обратно на главную страницу
  return NextResponse.redirect(new URL('/', request.url));
} 