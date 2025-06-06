import { NextResponse } from 'next/server';
import { moySkladClient } from '@/lib/moysklad';

export async function GET(request: Request) {
  try {
    if (!process.env.MOYSKLAD_TOKEN) {
      return NextResponse.json(
        { error: 'Не настроен токен МойСклад' },
        { status: 500 }
      );
    }

    console.log('Начало получения продуктов');
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Number(searchParams.get('limit')) || 24;
    const offset = Number(searchParams.get('offset')) || 0;

    const params = {
      filter: `archived=false${query ? `;name~=${query}` : ''}`,
      limit,
      offset,
      expand: 'images,salePrices,productFolder'
    };

    console.log('Параметры запроса:', params);
    const response = await moySkladClient.get('/entity/product', {
      params: params
    });
    
    console.log('Получен ответ от МойСклад:', {
      status: response.status,
      data: response.data
    });

    if (!response.data || !response.data.rows) {
      throw new Error('Некорректный формат ответа от API МойСклад');
    }

    const products = response.data.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.salePrices?.rows?.[0]?.value ? product.salePrices.rows[0].value / 100 : 0,
      imageUrl: product.images?.rows?.[0]?.miniature?.href || null,
      categoryId: product.productFolder?.id || '',
      categoryName: product.productFolder?.name || ''
    }));

    return NextResponse.json({
      rows: products,
      meta: response.data.meta
    });
  } catch (error: any) {
    console.error('Подробная ошибка при получении продуктов:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        params: error.config?.params
      }
    });

    const errorMessage = error.response?.data?.errors?.[0]?.error || 
                        error.message || 
                        'Ошибка сервера при получении продуктов';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
