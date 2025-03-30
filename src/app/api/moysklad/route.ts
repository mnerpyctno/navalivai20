import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Создаем клиент для MoySklad API
const msClient = axios.create({
  baseURL: 'https://api.moysklad.ru/api/remap/1.2',
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Accept': 'application/json;charset=utf-8',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Добавляем интерцептор для логирования
msClient.interceptors.request.use(request => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    params: request.params,
    headers: {
      ...request.headers,
      Authorization: 'Bearer ***'
    }
  });
  return request;
});

msClient.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    return Promise.reject(error);
  }
);

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
      config: error.config
    });

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized access to MoySklad API' },
        { status: 401 }
      );
    }

    if (error.response?.status === 400) {
      return NextResponse.json(
        { 
          error: 'Bad Request - Invalid parameters',
          details: error.response?.data,
          status: 400
        },
        { status: 400 }
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