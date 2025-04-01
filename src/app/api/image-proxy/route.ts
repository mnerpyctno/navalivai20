import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function OPTIONS(request: Request) {
  const headersList = headers();
  const origin = headersList.get('origin') || '*';

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // Проверяем, что URL от МойСклад
    if (!imageUrl.startsWith('https://api.moysklad.ru/')) {
      return new NextResponse('Invalid image source', { status: 400 });
    }

    console.log('Fetching image:', {
      url: imageUrl,
      token: process.env.NEXT_PUBLIC_MOYSKLAD_API_TOKEN?.slice(0, 5) + '...'
    });

    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MOYSKLAD_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('Error fetching image:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUrl
      });
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    const imageData = await response.arrayBuffer();

    // Получаем origin из заголовков запроса
    const headersList = headers();
    const origin = headersList.get('origin') || '*';

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 