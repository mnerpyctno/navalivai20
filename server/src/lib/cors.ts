import { NextResponse } from 'next/server';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
};

export const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Range'],
  maxAge: 86400,
  credentials: true,
};

export function corsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export function corsErrorResponse(error: any, status: number = 500) {
  return corsResponse(
    {
      error: error.message || 'Internal Server Error',
      details: error,
    },
    status
  );
}

export function corsPreflightResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
