import { NextResponse } from 'next/server';
import { moySkladClient } from '@/lib/moysklad';

export async function GET() {
  try {
    console.log('Начало получения категорий');
    
    const params = {
      limit: 100,
      offset: 0,
      expand: 'pathName'
    };

    console.log('Параметры запроса:', JSON.stringify(params, null, 2));
    
    const response = await moySkladClient.get('/entity/productfolder', {
      params: params
    });
    
    console.log('Получен ответ от МойСклад:', {
      status: response.status,
      data: JSON.stringify(response.data, null, 2),
      headers: response.headers
    });
    
    if (response.status === 400) {
      console.error('Ошибка API МойСклад:', {
        errors: response.data?.errors,
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      throw new Error('Ошибка API МойСклад: ' + JSON.stringify(response.data?.errors));
    }

    if (!response.data || !response.data.rows) {
      console.error('Некорректный формат ответа:', JSON.stringify(response.data, null, 2));
      throw new Error('Некорректный формат ответа от API МойСклад');
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Подробная ошибка при получении категорий:', {
      message: error.message,
      response: error.response?.data ? JSON.stringify(error.response.data, null, 2) : undefined,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
        params: error.config?.params
      },
      stack: error.stack
    });

    const errorMessage = error.response?.data?.errors?.[0]?.error || 
                        error.message || 
                        'Ошибка сервера при получении категорий';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
