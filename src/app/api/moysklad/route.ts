import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Создаем клиент для MoySklad API
const msClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get('method');
    const url = searchParams.get('url');
    const params = searchParams.get('params');

    if (!method || !url) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Преобразуем строковые параметры в объект
    let parsedParams: Record<string, any> = {};
    if (params) {
      try {
        parsedParams = JSON.parse(params);
        // Преобразуем строковые значения в числа, где это необходимо
        if (parsedParams.limit) parsedParams.limit = parseInt(parsedParams.limit as string);
        if (parsedParams.offset) parsedParams.offset = parseInt(parsedParams.offset as string);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid parameters format' },
          { status: 400 }
        );
      }
    }

    const requestUrl = url.startsWith('/') ? url.slice(1) : url;
    
    const response = await msClient({
      method: method.toLowerCase(),
      url: requestUrl,
      params: parsedParams
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('MoySklad API error:', error);

    if (error.response) {
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 