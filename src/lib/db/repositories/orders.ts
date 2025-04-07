import { prisma } from '../client';
import { Prisma } from '@prisma/client';

export const ordersRepository = {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
<<<<<<< HEAD
        orderItems: true
=======
        items: true
>>>>>>> 403f6ea (Last version)
      }
    });
  },

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
<<<<<<< HEAD
        orderItems: true
=======
        items: true
>>>>>>> 403f6ea (Last version)
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
<<<<<<< HEAD
        orderItems: true
=======
        items: true
>>>>>>> 403f6ea (Last version)
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