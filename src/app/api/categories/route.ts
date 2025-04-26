import { NextResponse } from 'next/server';
import { moySkladClient } from '@/lib/moysklad';

export async function GET() {
  try {
    console.log('Начало получения категорий');
    
    const params = {
      limit: 100,
      offset: 0,
      expand: 'pathName,productFolder',
      order: 'name,asc',
      filter: 'archived=false'
    };

    console.log('Параметры запроса:', params);
    
    // Проверяем токен перед запросом
    const token = process.env.MOYSKLAD_TOKEN;
    if (!token) {
      throw new Error('MOYSKLAD_TOKEN не установлен');
    }
    console.log('Длина токена:', token.length);
    
    const response = await moySkladClient.get('/entity/productfolder', {
      params: params
    });
    
    console.log('Получен ответ от МойСклад:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    if (!response.data || !response.data.rows) {
      console.error('Некорректный формат ответа:', response.data);
      throw new Error('Некорректный формат ответа от API МойСклад');
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null,
      archived: category.archived || false
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Подробная ошибка при получении категорий:', {
      message: error.message,
      response: error.response?.data,
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
