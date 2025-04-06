import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { telegramId, firstName, lastName, username, photoUrl } = data;

    if (!telegramId || !firstName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Отправляем запрос на сервер
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/register`, {
      telegramId,
      firstName,
      lastName,
      username,
      photoUrl,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 