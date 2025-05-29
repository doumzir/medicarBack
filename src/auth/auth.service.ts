import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import { createId } from '@paralleldrive/cuid2';
import { MailerService } from 'src/mailer.service';
import { PrismaService } from '../prisma.service';
import type { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Payload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async login({ authBody }: { authBody: LoginDto }) {
    try {
      const { email, password } = authBody;

      const existingUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      const isPasswordValid = await this.isPasswordValid({
        password,
        hashedPassword: existingUser?.password ?? '',
      });

      if (!isPasswordValid || !existingUser) {
        throw new Error('Email or password incorrect');
      }
      return this.authenticateUser({
        userId: existingUser.id,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return {
        error: true,
        message: "Une erreur inattendue s'est produite pendant la connexion",
      };
    }
  }

  async register({ registerBody }: { registerBody: RegisterDto }) {
    try {
      const { email, firstName, lastName, password, role } = registerBody;

      const existingUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new Error('Account already exists with this email');
      }
      // we need to check if the password is strong enough
      const passwordRegex =
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
      if (!passwordRegex.test(password)) {
        throw new Error(
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        );
      }
      const hashedPassword = await this.hashPassword({ password });

      const createdUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role,
        },
      });

      await this.mailerService.sendWelcomeEmail({
        recipient: createdUser.email,
        firstName: createdUser.firstName,
      });

      return this.authenticateUser({
        userId: createdUser.id,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return {
        error: true,
        message: 'an unexpected error occurred during registration',
      };
    }
  }

  private async hashPassword({ password }: { password: string }) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }
  private async isPasswordValid({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }

  private authenticateUser({ userId }: Payload) {
    const payload: Payload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetUserPasswordRequest({ email }: { email: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          isResetPassword: true,
          firstName: true,
          email: true,
        },
      });

      if (!existingUser) {
        throw new Error('The user does not exist.');
      }

      if (existingUser.isResetPassword === true) {
        throw new Error('A password reset request is already in progress.');
      }

      const createdId = createId();
      await this.prisma.user.update({
        where: {
          email,
        },
        data: {
          isResetPassword: true,
          resetPasswordToken: createdId,
        },
      });
      await this.mailerService.sendRequestedPasswordEmail({
        firstName: existingUser.firstName,
        recipient: existingUser.email,
        token: createdId,
      });

      return {
        error: false,
        message: 'Please check your emails to reset your password.',
      };
      // return this.authenticateUser({
      //   userId: existingUser.id,
      // });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return {
        error: true,
        message: 'An unexpected error occurred during password reset request',
      };
    }
  }

  async verifyResetPasswordToken({ token }: { token: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error('The user does not exist.');
      }

      if (existingUser.isResetPassword === false) {
        throw new Error('A password reset request is not in progress.');
      }

      return {
        error: false,
        message: 'The token is valid and can be used.',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return {
        error: true,
        message: 'An unexpected error occurred during password reset request',
      };
    }
  }

  async resetUserPassword({
    resetPasswordDto,
  }: {
    resetPasswordDto: ResetPasswordDto;
  }) {
    try {
      const { password, token } = resetPasswordDto;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error('The user does not exist.');
      }

      if (existingUser.isResetPassword === false) {
        throw new Error('A password reset request is not in progress.');
      }

      const hashedPassword = await this.hashPassword({
        password,
      });
      await this.prisma.user.update({
        where: {
          resetPasswordToken: token,
        },
        data: {
          isResetPassword: false,
          password: hashedPassword,
        },
      });

      return {
        error: false,
        message: 'Votre mot de passe a bien été changé.',
      };
      // return this.authenticateUser({
      //   userId: existingUser.id,
      // });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { error: true, message: error.message };
      }
      return {
        error: true,
        message: 'An unexpected error occurred during password reset',
      };
    }
  }
}
