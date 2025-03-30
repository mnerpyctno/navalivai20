import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Создаем клиент для MoySklad API
const msClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json;charset=utf-8'
  },
  timeout: 30000
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const method = searchParams.get('method');
    const url = searchParams.get('url');
    const params = searchParams.get('params');

    console.log('API Request:', {
      method,
      url,
      params: params ? JSON.parse(params) : null,
      token: process.env.MOYSKLAD_TOKEN ? 'Present' : 'Missing'
    });

    if (!process.env.MOYSKLAD_TOKEN) {
      console.error('MoySklad token is missing');
      return NextResponse.json(
        { error: 'MoySklad token is missing' },
        { status: 401 }
      );
    }

    if (!method || !url) {
      console.error('Missing required parameters:', { method, url });
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
        console.error('Error parsing params:', e);
        return NextResponse.json(
          { error: 'Invalid parameters format' },
          { status: 400 }
        );
      }
    }

    const requestUrl = url.startsWith('/') ? url.slice(1) : url;
    
    console.log('Making request to MoySklad:', {
      url: requestUrl,
      method: method.toLowerCase(),
      params: parsedParams,
      fullUrl: `${msClient.defaults.baseURL}/${requestUrl}`
    });

    const response = await msClient({
      method: method.toLowerCase(),
      url: requestUrl,
      params: parsedParams
    });

    console.log('MoySklad response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    if (!response.data) {
      console.error('Empty response from MoySklad');
      throw new Error('Empty response from MoySklad');
    }

    return NextResponse.json({ data: response.data });
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: error.config
    });

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized access to MoySklad API' },
        { status: 401 }
      );
    }

    if (error.response?.status === 412) {
      return NextResponse.json(
        { error: 'Precondition Failed - Check API version and parameters' },
        { status: 412 }
      );
    }

    return NextResponse.json(
      { 
        error: error.response?.data?.error || error.message || 'Internal Server Error',
        details: error.response?.data,
        status: error.response?.status || 500
      },
      { status: error.response?.status || 500 }
    );
  }
} 