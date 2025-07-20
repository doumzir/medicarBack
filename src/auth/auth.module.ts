import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailerService } from 'src/mailer.service';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    JwtStrategy,
    AuthService,
    UsersService,
    MailerService,
  ],
})
export class AuthModule {}
