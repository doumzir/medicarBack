import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RequestUser } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  // With a email and passwor the user is authenticated and the token is returned (ex:abc123)
  @Post('login')
  async login(@Body() authBody: LoginDto) {
    return await this.authService.login({
      authBody,
    });
  }
  // With a token (ex:abc123) the user is authenticated and the user is returned
  @UseGuards(JwtAuthGuard)
  @Get()
  async AuthenticatedUser(@Request() request: RequestUser) {
    // abc123 => {userId: "123"}
    return await this.userService.getUser({
      userId: request.user.userId,
    });
  }
  @Post('register')
  async register(@Body() registerBody: RegisterDto) {
    return await this.authService.register({
      registerBody,
    });
  }
  @Post('request-reset-password')
  async resetUserPasswordRequest(@Body('email') email: string) {
    return await this.authService.resetUserPasswordRequest({
      email,
    });
  }

  @Post('reset-password')
  async resetUserPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetUserPassword({
      resetPasswordDto,
    });
  }
  @Get('verify-reset-password-token')
  async verifyResetPasswordToken(@Query('token') token: string) {
    return await this.authService.verifyResetPasswordToken({
      token,
    });
  }
}
