# Navaliva Next TWA

Telegram Web App для магазина Navaliva, интегрированный с МойСклад.

## Технологии

- Next.js 14
- TypeScript
- Prisma
- NextAuth.js
- Tailwind CSS
- Telegram Web App
- МойСклад API

## Функциональность

- Авторизация через Telegram
- Просмотр каталога товаров
- Корзина покупок
- Оформление заказов
- Синхронизация с МойСклад
- История заказов

## Разработка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/navalivaishop"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
MOYSKLAD_TOKEN="your-moysklad-token"
MOYSKLAD_API_URL="https://api.moysklad.ru/api/remap/1.2"
```

3. Примените миграции базы данных:
```bash
npx prisma migrate dev
```

4. Запустите сервер разработки:
```bash
npm run dev
```

## Развертывание

Инструкции по развертыванию на Vercel доступны в [DEPLOY.md](DEPLOY.md).

### Проверка перед деплоем

1. Убедитесь, что все переменные окружения заданы:
   - `MOYSKLAD_TOKEN`
   - `PORT`
2. Проверьте, что проект успешно собирается локально.
3. Убедитесь, что файл `vercel.json` настроен корректно.

## Структура проекта

```
src/
  ├── app/              # Next.js App Router
  │   ├── api/         # API endpoints
  │   ├── auth/        # Страницы авторизации
  │   └── page.tsx     # Главная страница
  ├── components/      # React компоненты
  ├── hooks/          # React хуки
  ├── lib/            # Утилиты и конфигурация
  ├── styles/         # CSS стили
  └── types/          # TypeScript типы
```

## API Endpoints

### Авторизация
- `POST /api/auth/signin` - Вход через Telegram
- `POST /api/auth/signout` - Выход

### Пользователи
- `GET /api/users` - Получение данных пользователя
- `POST /api/users` - Создание/обновление пользователя

### МойСклад
- `GET /api/moysklad/orders` - Получение заказов пользователя
- `POST /api/moysklad/orders` - Создание заказа
- `POST /api/moysklad/sync` - Синхронизация пользователя с МойСклад

## Лицензия

MIT
