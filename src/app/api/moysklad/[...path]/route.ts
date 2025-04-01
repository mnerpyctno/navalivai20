import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const baseUrl = process.env.MOYSKLAD_API_URL || 'https://api.moysklad.ru/api/remap/1.2';
    const url = new URL(`${baseUrl}/${path}`);
    
    // Копируем все параметры запроса
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Логируем запрос только в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Проксирование запроса к МойСклад:', {
        url: url.toString(),
        params: Object.fromEntries(url.searchParams),
        headers: {
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Логируем ошибку
      console.error('Ошибка ответа от МойСклад:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        params: Object.fromEntries(url.searchParams),
        error: errorData
      });

      return NextResponse.json(
        { error: errorData?.error || 'Ошибка при получении данных' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Логируем ответ только в development
    if (process.env.NODE_ENV === 'development') {
      console.log('Ответ от МойСклад:', {
        status: response.status,
        data: {
          meta: data.meta,
          rows: data.rows?.map((item: any) => ({
            id: item.id,
            name: item.name,
            hasImages: !!item.images,
            imagesMeta: item.images?.meta,
            imagesRows: item.images?.rows?.length,
            firstImage: item.images?.rows?.[0],
            firstImageMiniature: item.images?.rows?.[0]?.miniature
          }))
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка при проксировании запроса к МойСклад:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
      { status: 500 }
    );
  }
} 