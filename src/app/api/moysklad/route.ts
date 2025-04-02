import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 секунда
const MOYSKLAD_API_URL = 'https://api.moysklad.ru/api/remap/1.2';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
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

    const moySkladUrl = `https://api.moysklad.ru/api/remap/1.2/${url}`;
    const headers = {
      'Authorization': `Bearer ${env.moyskladApiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const response = await fetch(moySkladUrl, {
      method,
      headers,
      body: params ? params : undefined
    });

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
    console.error('Error in MoySklad proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 