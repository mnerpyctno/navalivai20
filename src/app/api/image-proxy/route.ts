import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { env } from '@/config/env';
import { cache } from '@/lib/cache';
import { CACHE_KEYS } from '@/config/cache';
import { corsPreflightResponse, corsHeaders } from '@/lib/cors';

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('URL параметр обязателен', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Проверяем, что URL от Мой Склад
    if (!imageUrl.startsWith('https://api.moysklad.ru/')) {
      return new NextResponse('Недопустимый источник изображения', { 
        status: 400,
        headers: corsHeaders
      });
    }

    // Проверяем кэш
    const cacheKey = CACHE_KEYS.IMAGE(imageUrl);
    const cachedImage = cache.get<ArrayBuffer>(cacheKey);
    
    if (cachedImage) {
      return new NextResponse(cachedImage, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders
        },
      });
    }

    // Получаем изображение
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${env.moySkladToken}`,
        'Accept': 'image/*'
      },
    });

    if (!response.ok) {
      console.error('Ошибка получения изображения:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      });
      return new NextResponse('Ошибка получения изображения', { 
        status: response.status,
        headers: corsHeaders
      });
    }

    const contentType = response.headers.get('content-type');
    const imageData = await response.arrayBuffer();

    // Кэшируем изображение
    cache.set(cacheKey, imageData, env.cacheTtl.images);
    
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...corsHeaders
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return new NextResponse('Внутренняя ошибка сервера', { 
      status: 500,
      headers: corsHeaders
    });
  }
} 