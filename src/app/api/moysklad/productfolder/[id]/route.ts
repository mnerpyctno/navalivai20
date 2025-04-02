import { NextRequest, NextResponse } from 'next/server';
import { MOYSKLAD_CONFIG } from '@/lib/moysklad/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const moySkladUrl = `${MOYSKLAD_CONFIG.baseUrl}${MOYSKLAD_CONFIG.endpoints.productFolder}/${params.id}`;

    const response = await fetch(moySkladUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`MoySklad API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in MoySklad category route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 