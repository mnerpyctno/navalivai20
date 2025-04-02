import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    // Проверяем подключение к базе данных
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно установлено');

    // Проверяем создание тестового пользователя
    const testUser = await prisma.user.create({
      data: {
        telegramId: 'test_' + Date.now(),
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        authDate: new Date(),
      },
    });
    console.log('✅ Тестовый пользователь создан:', testUser);

    // Проверяем чтение пользователя
    const user = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    console.log('✅ Тестовый пользователь успешно прочитан:', user);

    // Проверяем создание корзины
    const cart = await prisma.cart.create({
      data: {
        userId: testUser.id,
      },
    });
    console.log('✅ Тестовая корзина создана:', cart);

    // Проверяем создание элемента корзины
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: 'test_product',
        quantity: 1,
      },
    });
    console.log('✅ Тестовый элемент корзины создан:', cartItem);

    // Проверяем создание заказа
    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        total: 100,
        items: {
          create: {
            productId: 'test_product',
            quantity: 1,
            price: 100,
          },
        },
      },
    });
    console.log('✅ Тестовый заказ создан:', order);

    // Очищаем тестовые данные
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Тестовые данные успешно удалены');

    console.log('✅ Все тесты успешно пройдены!');
  } catch (error) {
    console.error('❌ Ошибка при тестировании базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем тесты
testDatabaseConnection(); 