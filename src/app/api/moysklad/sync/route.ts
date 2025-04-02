import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MoySkladAPI } from '@/lib/moysklad';
import { corsResponse, corsErrorResponse, corsPreflightResponse } from '@/lib/cors';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function OPTIONS() {
  return corsPreflightResponse();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id) {
      return corsErrorResponse(
        { message: 'Unauthorized' },
        401
      );
    }

    const body = await request.json();
    const { telegramUser } = body;

    if (!telegramUser) {
      return corsErrorResponse(
        { message: 'Telegram user data is required' },
        400
      );
    }

    const moySklad = MoySkladAPI.getInstance();
    const customer = await moySklad.upsertCustomer(user.id, telegramUser);
    
    return corsResponse(customer);
  } catch (error) {
    console.error('Error syncing user with MoySklad:', error);
    return corsErrorResponse(error);
  }
} 