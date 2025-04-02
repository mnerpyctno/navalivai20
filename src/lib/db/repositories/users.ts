import { prisma } from '../client';
import { User } from '../config';
import { Prisma } from '@prisma/client';

export const usersRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  async findByTelegramId(telegramId: string) {
    return prisma.user.findUnique({
      where: { telegramId }
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data
    });
  },

  async upsertByTelegramId(telegramId: string, data: Prisma.UserCreateInput) {
    return prisma.user.upsert({
      where: { telegramId },
      create: data,
      update: data
    });
  }
}; 