import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
// This class extends the PrismaClient and has all the methods of the Prisma Client ( the table of the prisma schema)
// OnModuleInit is used to connect to the database when the NestJS module is initialized (when the app is starting)
// OnModuleDestroy is used to disconnect from the database when the NestJS module is destroyed (when the app is stopping)
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
