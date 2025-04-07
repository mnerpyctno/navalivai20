import { NextResponse } from 'next/server';
import { moySkladClient } from '../../../../server/src/config/moysklad'; // Обновлен импорт

export async function GET(request: Request) {
  try {
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

    const response = await moySkladClient.get('/entity/product', { params });

    const products = response.data.rows.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.salePrices?.[0]?.value / 100 || 0,
      imageUrl: product.images?.rows?.[0]?.miniature?.href || null,
      categoryId: product.productFolder?.id || '',
      categoryName: product.productFolder?.name || ''
    }));

    return NextResponse.json({
      rows: products,
      meta: response.data.meta
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
