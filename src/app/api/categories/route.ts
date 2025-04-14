import { NextResponse } from 'next/server';
import { moySkladClient } from '../../../../server/src/config/moysklad'; // Обновлен импорт

export async function GET() {
  try {
    console.log('Начало получения категорий');
    const response = await moySkladClient.get('/entity/productfolder');
    console.log('Получен ответ от МойСклад:', response.status);
    
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
        headers: error.config?.headers
      }
    });
    return NextResponse.json(
      { error: 'Ошибка сервера при получении категорий' },
      { status: 500 }
    );
  }
}
