import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const encodedUrl = searchParams.get('url');

    if (!encodedUrl) {
      console.error('Отсутствует параметр URL');
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const url = decodeURIComponent(encodedUrl);
    console.log('Загрузка изображения с URL:', url);

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        'Accept': 'image/*'
      }
    });

    if (!response.data) {
      console.error('Пустой ответ от сервера');
      return new NextResponse('Empty response from server', { status: 500 });
    }

    const contentType = response.headers['content-type'];
    console.log('Тип контента:', contentType);
    
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    if (axios.isAxiosError(error)) {
      console.error('Детали ошибки:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    }
    return new NextResponse('Error fetching image', { status: 500 });
  }
} 