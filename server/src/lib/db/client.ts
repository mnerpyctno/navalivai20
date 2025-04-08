import { PrismaClient } from '@prisma/client';

class DatabaseClient {
  private static instance: DatabaseClient;
  private client: PrismaClient;

  private constructor() {
    this.client = new PrismaClient();
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public get prisma(): PrismaClient {
    return this.client;
  }

  public async connect(): Promise<void> {
    await this.client.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export const dbClient = DatabaseClient.getInstance();
export const prisma = dbClient.prisma;
