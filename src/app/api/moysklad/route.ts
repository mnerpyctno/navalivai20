import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 секунда
const MOYSKLAD_API_URL = 'https://api.moysklad.ru/api/remap/1.2';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method') || 'GET';
    const url = searchParams.get('url');
    const params = searchParams.get('params');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const moySkladUrl = `${MOYSKLAD_API_URL}/${url}`;
        const headers = {
          'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const response = await fetch(moySkladUrl, {
          method,
          headers,
          body: params ? params : undefined
        });

        if (response.status === 412 || response.status === 429) {
          const retryAfter = response.headers.get('x-lognex-retry-after');
          if (retries < MAX_RETRIES - 1) {
            await delay(parseInt(retryAfter || '3') * 1000);
            retries++;
            continue;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          return NextResponse.json(
            { error: errorData || 'MoySklad API error' },
            { status: response.status }
          );
        }

        const data = await response.json();
        return NextResponse.json(data);
      } catch (error) {
        if (retries === MAX_RETRIES - 1) {
          throw error;
        }
        await delay(RETRY_DELAY);
        retries++;
      }
    }

    throw new Error('Max retries exceeded');
  } catch (error) {
    console.error('Error in MoySklad proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 