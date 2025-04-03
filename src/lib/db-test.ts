import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function testDatabase() {
  try {
    await prisma.$connect();
    
    // Создаем тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: '123456789',
        username: 'test_user',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    // Читаем тестового пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: '123456789' }
    });

    // Создаем тестовую корзину
    const cart = await prisma.cart.create({
      data: {
        userId: user!.id,
        status: 'active'
      }
    });

    // Создаем тестовый элемент корзины
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: 'test-product-id',
        quantity: 1
      }
    });

    // Создаем тестовый заказ
    const order = await prisma.order.create({
      data: {
        userId: user!.id,
        status: 'pending',
        total: 1000
      }
    });

    // Удаляем тестовые данные
    await prisma.cartItem.delete({ where: { id: cartItem.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.user.delete({ where: { id: user!.id } });

  } catch (error) {
    console.error('❌ Ошибка при тестировании базы данных:', error);
    throw error;
  }
}

// Запускаем тесты
testDatabase(); 