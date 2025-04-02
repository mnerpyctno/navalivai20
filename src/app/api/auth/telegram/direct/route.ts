import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MoySkladAPI } from '@/lib/moysklad';

const prisma = new PrismaClient();

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

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 