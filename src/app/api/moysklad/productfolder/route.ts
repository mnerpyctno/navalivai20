import { NextRequest, NextResponse } from 'next/server';
import { MOYSKLAD_CONFIG } from '@/lib/moysklad/config';

export async function GET() {
  try {
    const moySkladUrl = new URL(`${MOYSKLAD_CONFIG.baseUrl}${MOYSKLAD_CONFIG.endpoints.productFolder}`);

    const response = await fetch(moySkladUrl.toString(), {
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
    console.error('Error in MoySklad categories route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 