import { NextResponse } from 'next/server';
import { webhooksApi } from '@/api/webhooks';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Проверяем, что это вебхук с данными об остатках
    if (data.entityType === 'reportstockbystore') {
      await webhooksApi.handleStockWebhook(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при обработке вебхука:', error);
    return NextResponse.json(
      { error: 'Ошибка при обработке вебхука' },
      { status: 500 }
    );
  }
} 