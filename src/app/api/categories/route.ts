import { NextResponse } from 'next/server';
import { moySkladClient } from '../../../../server/src/config/moysklad'; // Обновлен импорт

export async function GET() {
  try {
    const response = await moySkladClient.get('/entity/productfolder');
    
    const categories = response.data.rows.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      parentId: category.pathName || null
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
