import { NextRequest, NextResponse } from 'next/server';
import { corsResponse, corsErrorResponse, corsPreflightResponse } from '@/lib/cors';
import { env } from '@/config/env';
import axios from 'axios';

// Создаем клиент для MoySklad API
const moySkladApi = axios.create({
  baseURL: process.env.MOYSKLAD_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`
  }
});

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    const parsedParams = Object.fromEntries(searchParams.entries());

    // Выполняем запрос к MoySklad
    const response = await moySkladApi.get(path, { params: parsedParams });

    return corsResponse(response.data);
  } catch (error: any) {
    console.error('MoySklad API Error:', error);
    return corsErrorResponse(
      error.message || 'Ошибка при запросе к MoySklad',
      error.response?.status || 500
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();

    // Выполняем запрос к MoySklad
    const response = await moySkladApi.post(path, body);

    return corsResponse(response.data);
  } catch (error: any) {
    console.error('MoySklad API Error:', error);
    return corsErrorResponse(
      error.message || 'Ошибка при запросе к MoySklad',
      error.response?.status || 500
    );
  }
} 