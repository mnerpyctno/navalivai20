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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id) {
      return corsErrorResponse(
        { message: 'Unauthorized' },
        401
      );
    }

    const moySklad = MoySkladAPI.getInstance();
    const orders = await moySklad.getUserOrders(user.id);
    
    return corsResponse(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return corsErrorResponse(error);
  }
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
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return corsErrorResponse(
        { message: 'Invalid items data' },
        400
      );
    }

    const moySklad = MoySkladAPI.getInstance();
    const order = await moySklad.createOrder(user.id, items);
    
    return corsResponse(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return corsErrorResponse(error);
  }
} 