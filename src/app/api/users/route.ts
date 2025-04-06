import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { TelegramUser } from '@/types/telegram';

const prismaClient = new PrismaClient();

// Создание или обновление пользователя
export async function POST(request: Request) {
  try {
    const userData: TelegramUser = await request.json();

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: {
        telegramId: userData.id.toString(),
      },
    });

    if (existingUser) {
      // Обновляем данные существующего пользователя
      const updatedUser = await prisma.user.update({
        where: {
          telegramId: userData.id.toString(),
        },
        data: {
          firstName: userData.first_name,
          lastName: userData.last_name || null,
          username: userData.username || null,
          photoUrl: userData.photo_url || null,
          authDate: userData.auth_date ? new Date(userData.auth_date * 1000) : new Date(),
        },
      });

      return NextResponse.json(updatedUser);
    }

    // Создаем нового пользователя
    const newUser = await prisma.user.create({
      data: {
        telegramId: userData.id.toString(),
        firstName: userData.first_name,
        lastName: userData.last_name || null,
        username: userData.username || null,
        photoUrl: userData.photo_url || null,
        authDate: userData.auth_date ? new Date(userData.auth_date * 1000) : new Date(),
        cart: {
          create: {} // Создаем пустую корзину
        }
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}

// Получение данных пользователя
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegramId');

    if (!telegramId) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { telegramId },
      include: {
        cart: {
          include: {
            items: true
          }
        },
        orders: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 