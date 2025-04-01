import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Получаем ответ
  const response = NextResponse.next();

  // Добавляем CORS заголовки только для API запросов
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Если это OPTIONS запрос, возвращаем пустой ответ
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 