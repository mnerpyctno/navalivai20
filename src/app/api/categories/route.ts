import { NextResponse } from 'next/server';
import { moySkladClient } from '@/lib/moysklad';

// Временные моковые данные
const mockCategories = [
  { id: '1', name: 'Категория 1', description: 'Описание категории 1', parentId: null },
  { id: '2', name: 'Категория 2', description: 'Описание категории 2', parentId: null },
  { id: '3', name: 'Подкатегория 1', description: 'Описание подкатегории 1', parentId: '1' }
];

export async function GET() {
  try {
    console.log('Проверка переменных окружения:', {
      hasToken: !!process.env.MOYSKLAD_TOKEN,
      apiUrl: process.env.MOYSKLAD_API_URL,
      nodeEnv: process.env.NODE_ENV
    });

    // Если нет токена, возвращаем моковые данные
    if (!process.env.MOYSKLAD_TOKEN) {
      console.warn('Используются моковые данные для категорий');
      return NextResponse.json(mockCategories);
    }

    console.log('Начало получения категорий');
    
    const params = {
      limit: 100,
      offset: 0
    };

    console.log('Параметры запроса:', JSON.stringify(params, null, 2));
    
    const response = await moySkladClient.get('/entity/productfolder', {
      params: params
    }).catch(error => {
      console.error('Ошибка при запросе к МойСклад:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          headers: {
            ...error.config?.headers,
            Authorization: '[REDACTED]'
          }
        }
      });
      
      // В случае ошибки возвращаем моковые данные
      console.warn('Используются моковые данные из-за ошибки API');
      return { data: { rows: mockCategories } };
    });
    
    console.log('Ответ от МойСклад:', {
      status: 'status' in response ? response.status : 'mock data',
      hasData: !!response.data,
      hasRows: !!response.data?.rows,
      rowsCount: response.data?.rows?.length
    });

    if (!response.data || !response.data.rows) {
      console.warn('Некорректный формат ответа, используем моковые данные');
      return NextResponse.json(mockCategories);
    }

    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Критическая ошибка при получении категорий:', {
      message: error.message,
      stack: error.stack
    });
    
    // В случае критической ошибки возвращаем моковые данные
    return NextResponse.json(mockCategories);
  }
}
