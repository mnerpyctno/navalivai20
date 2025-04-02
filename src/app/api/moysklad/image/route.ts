import { NextRequest } from 'next/server';
import { corsResponse, corsErrorResponse, corsHeaders, corsPreflightResponse } from '@/lib/cors';
import { env } from '@/config/env';

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get('url');
    
    if (!imageUrl) {
      return corsErrorResponse(
        { message: 'URL изображения не указан' },
        400
      );
    }

    if (!env.moySkladToken) {
      return corsErrorResponse(
        { message: 'Токен API не настроен' },
        500
      );
    }

    // Проверяем, что URL начинается с https://api.moysklad.ru
    if (!imageUrl.startsWith('https://api.moysklad.ru')) {
      return corsErrorResponse(
        { message: 'Недопустимый URL изображения' },
        400
      );
    }

    // Добавляем параметр miniature=true, если его нет
    const url = new URL(imageUrl);
    if (!url.searchParams.has('miniature')) {
      url.searchParams.set('miniature', 'true');
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${env.moySkladToken}`,
        'Accept': 'image/*',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      return corsErrorResponse(
        { message: `Ошибка загрузки изображения: ${response.statusText}` },
        response.status
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...corsHeaders
      }
    });
  } catch (error) {
    return corsErrorResponse(error);
  }
} 