import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(userId: string) {
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

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private signToken(
    userId: string,
    email: string,
    role: string,
  ): { userId: string; email: string; role: string } {
    return { userId, email, role };
  }

  async signup(dto: SignupDto) {
    const hash = await this.hashPassword(dto.password);

    // Vérifie que l'email n'existe pas
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    if (emailExists) throw new ForbiddenException('Email déjà utilisé');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
      },
    });

    return this.signToken(user.id, user.email, user.role);
  }
  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: dto.email },
    });
    return this.signToken(user.id, user.email, user.role);
  }
}
