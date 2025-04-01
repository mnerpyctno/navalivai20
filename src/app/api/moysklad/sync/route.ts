import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MoySkladAPI } from '@/lib/moysklad';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { telegramUser } = body;

    if (!telegramUser) {
      return NextResponse.json(
        { error: 'Telegram user data is required' },
        { status: 400 }
      );
    }

    const moySklad = MoySkladAPI.getInstance();
    const customer = await moySklad.upsertCustomer(user.id, telegramUser);
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error syncing user with MoySklad:', error);
    return NextResponse.json(
      { error: 'Failed to sync user with MoySklad' },
      { status: 500 }
    );
  }
} 