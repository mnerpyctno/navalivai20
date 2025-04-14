import { NextResponse } from 'next/server';
import { moySkladClient } from '../../../../server/src/config/moysklad';

export async function GET() {
  try {
    console.log('Начало получения категорий');
    
    const params = {
      limit: 100,
      offset: 0,
      expand: 'pathName'
    };

    console.log('Параметры запроса:', params);
    const response = await moySkladClient.get('/entity/productfolder', { params });
    console.log('Получен ответ от МойСклад:', {
      status: response.status,
      data: response.data
    });
    
    if (!response.data || !response.data.rows) {
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
                        'Ошибка сервера при получении категорий';

    return NextResponse.json(
      { error: errorMessage },
      { status: error.response?.status || 500 }
    );
  }
}
