import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL изображения не указан', { 
      status: 400,
      headers: corsHeaders
    });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/*'
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка загрузки изображения: ${response.statusText}`);
    }

    const imageData = await response.arrayBuffer();
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    return new NextResponse('Ошибка при загрузке изображения', { 
      status: 500,
      headers: corsHeaders
    });
  }
} 