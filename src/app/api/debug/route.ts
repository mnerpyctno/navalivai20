import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      hasToken: !!process.env.MOYSKLAD_TOKEN,
      tokenLength: process.env.MOYSKLAD_TOKEN?.length,
      apiUrl: process.env.MOYSKLAD_API_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    };

    console.log('Отладочная информация:', envVars);

    return NextResponse.json({
      success: true,
      environment: envVars,
      message: 'Это отладочный эндпоинт'
    });
  } catch (error: any) {
    console.error('Ошибка в отладочном эндпоинте:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 