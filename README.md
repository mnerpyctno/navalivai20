# Navaliva Shop

Проект интернет-магазина для Telegram Web App.

## Деплой на Vercel

### Предварительные требования

1. Убедитесь, что у вас есть аккаунт на [Vercel](https://vercel.com)
2. Подключите ваш GitHub репозиторий к Vercel
3. Настройте следующие переменные окружения в Vercel:

```
# API URLs
NEXT_PUBLIC_API_URL=https://navalivai20.vercel.app/api
MOYSKLAD_API_URL=https://api.moysklad.ru/api/remap/1.2

# API Tokens
MOYSKLAD_TOKEN=d12cc5134f6be8a828f343dca35e93cdb4de05b6

# Database URLs
DATABASE_URL="postgres://postgres.wepkbfowtalakrjekrtj:Kw5LEUX4siYRklGa@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
DIRECT_URL="postgres://postgres.wepkbfowtalakrjekrtj:Kw5LEUX4siYRklGa@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase Configuration
SUPABASE_URL="https://wepkbfowtalakrjekrtj.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://wepkbfowtalakrjekrtj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcGtiZm93dGFsYWtyamVrcnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0ODI1ODQsImV4cCI6MjA1OTA1ODU4NH0.e-3uNvoQxorvIL2lFEXoXH4nU3W9QqoKiiuv2w_ttvU"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcGtiZm93dGFsYWtyamVrcnRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQ4MjU4NCwiZXhwIjoyMDU5MDU4NTg0fQ.DlGc3RkZQzYHgT8DJ3KqRgql0lApinxGQ6G8TC_W_4E"

# Telegram Configuration
TELEGRAM_BOT_TOKEN=7619897197:AAFa9WJ1eka8sRTwbxsMir7tUERenm_KbgM
TELEGRAM_SECRET_KEY=7619897197:AAFa9WJ1eka8sRTwbxsMir7tUERenm_KbgM
TELEGRAM_BOT_USERNAME=navalivaishop_bot
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=7619897197:AAFa9WJ1eka8sRTwbxsMir7tUERenm_KbgM
NEXT_PUBLIC_TELEGRAM_SECRET_KEY=7619897197:AAFa9WJ1eka8sRTwbxsMir7tUERenm_KbgM
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=navalivaishop_bot

# URLs
NEXT_PUBLIC_WEBAPP_URL=https://navalivai20.vercel.app
WEBAPP_URL=https://navalivai20.vercel.app
NEXTAUTH_URL=https://navalivai20.vercel.app
NEXTAUTH_SECRET=vmzqCflsCL2D+ZsDqq1dOy8+NzgaDjePd1UuKUEW+Gk=

# Cache TTL (in seconds)
NEXT_PUBLIC_CACHE_TTL_PRODUCTS=3600
NEXT_PUBLIC_CACHE_TTL_CATEGORIES=86400
NEXT_PUBLIC_CACHE_TTL_STOCK=300
NEXT_PUBLIC_CACHE_TTL_IMAGES=86400

# Environment
NODE_ENV=production
```

### Процесс деплоя

1. Vercel автоматически обнаружит проект как Next.js приложение
2. При первом деплое Vercel запустит следующие команды:
   - `npm install`
   - `npm run build:all`
3. После успешной сборки приложение будет доступно по URL, указанному в Vercel

### Особенности конфигурации

- Проект использует Next.js 14 с поддержкой Server Actions
- Серверная часть работает на Node.js 18+
- База данных PostgreSQL через Prisma
- Оптимизированная конфигурация для Vercel
- Поддержка PWA
- Оптимизация изображений и кэширования

### Мониторинг и логи

- Логи доступны в панели управления Vercel
- Мониторинг производительности через Vercel Analytics
- Ошибки отслеживаются через Vercel Error Tracking

### Обновление проекта

1. Внесите изменения в код
2. Запушите изменения в GitHub
3. Vercel автоматически запустит новый деплой

### Устранение неполадок

1. Проверьте логи в панели Vercel
2. Убедитесь, что все переменные окружения правильно настроены
3. Проверьте статус базы данных
4. При необходимости перезапустите деплой

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
MOYSKLAD_API_TOKEN="your-moysklad-token"
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
