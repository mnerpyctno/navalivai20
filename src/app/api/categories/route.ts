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
    }).catch(error => {
      // Если есть ошибка от API, выводим её подробно
      if (error.response?.data?.errors) {
        console.error('Ошибки API МойСклад:', JSON.stringify(error.response.data.errors, null, 2));
        throw new Error(error.response.data.errors[0].error);
      }
      throw error;
    });
    
    // Если статус 400, считаем это ошибкой
    if (response.status === 400) {
      const errorMessage = response.data?.errors?.[0]?.error || 'Неизвестная ошибка API МойСклад';
      console.error('Ошибка API МойСклад:', {
        status: response.status,
        errors: response.data?.errors,
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    if (!response.data || !response.data.rows) {
      console.error('Некорректный формат ответа:', JSON.stringify(response.data, null, 2));
      return NextResponse.json(
        { error: 'Некорректный формат ответа от API МойСклад' },
        { status: 500 }
      );
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

    const errorMessage = error.message || 'Ошибка сервера при получении категорий';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
