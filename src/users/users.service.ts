import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import  { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getUsers() {
    const users = await this.prisma.user.findMany();
    return users;
  }
  async getUser({ userId }: { userId: string }) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });
      return user;
    } catch {
      throw new NotFoundException('User not found');
    }
  }
  async getPatients() {
    const patients = await this.prisma.user.findMany({
      where: {
        role: 'PATIENT',
      },
    });
    return patients;
  }

}
