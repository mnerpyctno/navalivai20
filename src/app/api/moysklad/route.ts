import { NextResponse } from 'next/server';
import axios from 'axios';

// Конфигурация API МойСклад
const API_VERSION = '1.2';
const BASE_URL = `https://api.moysklad.ru/api/remap/${API_VERSION}`;

// Создаем клиент для MoySklad API
const msClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Accept': 'application/json;charset=utf-8',
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

interface MoySkladParams {
  limit?: number;
  offset?: number;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method');
    const url = searchParams.get('url');
    const paramsStr = searchParams.get('params');

    console.log('Получен запрос к МойСклад:', {
      method,
      url,
      params: paramsStr
    });

    if (!method || !url) {
      console.error('Отсутствуют обязательные параметры:', { method, url });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!process.env.MOYSKLAD_TOKEN) {
      console.error('Отсутствует токен МойСклад');
      return NextResponse.json(
        { error: 'MoySklad token is not configured' },
        { status: 500 }
      );
    }

    let params: MoySkladParams = {};
    if (paramsStr) {
      try {
        params = JSON.parse(paramsStr);
        console.log('Распарсенные параметры:', params);
      } catch (e) {
        console.error('Ошибка при парсинге параметров:', e);
        return NextResponse.json(
          { error: 'Invalid parameters format' },
          { status: 400 }
        );
      }
    }

    // Преобразуем строковые значения в числа для limit и offset
    if (params.limit) params.limit = parseInt(String(params.limit));
    if (params.offset) params.offset = parseInt(String(params.offset));

    // Обрабатываем параметр expand
    if (params.expand) {
      // Убеждаемся, что images.rows включен в expand
      const expandParts = params.expand.split(',');
      if (!expandParts.includes('images.rows') && expandParts.includes('images')) {
        expandParts.push('images.rows');
        params.expand = expandParts.join(',');
      }
    }

    // Удаляем undefined параметры
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // Формируем URL для запроса
    const requestUrl = `${BASE_URL}/${url}`;
    console.log('Отправка запроса к МойСклад:', {
      url: requestUrl,
      method: method.toLowerCase(),
      params,
      expand: params.expand,
      filter: params.filter
    });

    const response = await msClient.request({
      method: method.toLowerCase(),
      url,
      params,
      validateStatus: (status) => status < 500 // Принимаем все статусы меньше 500
    });

    console.log('Ответ от МойСклад:', {
      status: response.status,
      statusText: response.statusText,
      data: {
        meta: response.data?.meta,
        rows: response.data?.rows?.map((item: any) => ({
          id: item.id,
          name: item.name,
          hasImages: !!item.images,
          imagesMeta: item.images?.meta,
          imagesRows: item.images?.rows?.length,
          firstImage: item.images?.rows?.[0],
          firstImageMiniature: item.images?.rows?.[0]?.miniature
        }))
      }
    });

    if (response.status >= 400) {
      console.error('Ошибка запроса к МойСклад:', {
        status: response.status,
        data: response.data,
        params: response.config.params
      });
      return NextResponse.json(
        { error: response.data?.error || 'Bad request' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Ошибка API МойСклад:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });

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