import { prisma } from '../client';
import { Prisma } from '@prisma/client';

export const ordersRepository = {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });
  },

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      include: {
        orderItems: true
      }
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}; 