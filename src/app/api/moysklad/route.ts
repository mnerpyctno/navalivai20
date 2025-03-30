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

// Добавляем интерцепторы для логирования
msClient.interceptors.request.use(request => {
  console.log('Request:', {
    url: request.url,
    method: request.method,
    params: request.params,
    headers: request.headers
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
    console.error('Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method');
    const url = searchParams.get('url');
    const paramsStr = searchParams.get('params');

    if (!method || !url || !paramsStr) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!process.env.MOYSKLAD_TOKEN) {
      return NextResponse.json(
        { error: 'MoySklad token is not configured' },
        { status: 500 }
      );
    }

    const params = JSON.parse(paramsStr);

    // Преобразуем строковые значения в числа для limit и offset
    if (params.limit) params.limit = parseInt(params.limit);
    if (params.offset) params.offset = parseInt(params.offset);

    // Удаляем undefined параметры
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await msClient.request({
      method: method.toLowerCase(),
      url,
      params
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API Error:', error);

    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized - Check MoySklad token' },
        { status: 401 }
      );
    }

    if (error.response?.status === 412) {
      return NextResponse.json(
        { error: 'API version mismatch - Please update API version' },
        { status: 412 }
      );
    }

    return NextResponse.json(
      { error: error.response?.data?.error || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
} 