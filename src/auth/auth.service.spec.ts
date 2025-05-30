import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { MailerService } from 'src/mailer.service';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, Role } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock createId
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'mock-cuid-123'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: {
    sign: jest.Mock;
  };
  let mailerService: {
    sendWelcomeEmail: jest.Mock;
    sendRequestedPasswordEmail: jest.Mock;
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: Role.PATIENT,
    isResetPassword: false,
    resetPasswordToken: null,
  };

  const mockJwtToken = 'mock-jwt-token-123';

  beforeEach(async () => {
    // Créer les mocks
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue(mockJwtToken),
    };

    const mockMailerService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendRequestedPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = mockPrismaService;
    jwtService = mockJwtService;
    mailerService = mockMailerService;

    // Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.login({ authBody: loginDto });

      // Assert
      expect(result).toEqual({
        access_token: mockJwtToken,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should fail when user does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.login({ authBody: loginDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'Email or password incorrect',
      });
    });

    it('should fail when password is incorrect', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.login({ authBody: loginDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'Email or password incorrect',
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await service.login({ authBody: loginDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'Database error',
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'Pierre',
      lastName: 'Martin',
      role: Role.PATIENT,
    };

    it('should successfully register a new user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      const createdUser = { ...mockUser, ...registerDto, id: 'new-user-123' };
      prismaService.user.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.register({ registerBody: registerDto });

      // Assert
      expect(result).toEqual({
        access_token: mockJwtToken,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashedPassword123',
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: registerDto.role,
        },
      });
      expect(mailerService.sendWelcomeEmail).toHaveBeenCalledWith({
        recipient: createdUser.email,
        firstName: createdUser.firstName,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: createdUser.id });
    });

    it('should fail when user already exists', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.register({ registerBody: registerDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'Account already exists with this email',
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should fail when password is not strong enough', async () => {
      // Arrange
      const weakPasswordDto = { ...registerDto, password: 'weak' };
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.register({ registerBody: weakPasswordDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      prismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await service.register({ registerBody: registerDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'Database error',
      });
    });
  });

  describe('resetUserPasswordRequest', () => {
    const email = 'test@example.com';

    it('should successfully create a password reset request', async () => {
      // Arrange
      const userForReset = {
        ...mockUser,
        isResetPassword: false,
      };
      prismaService.user.findUnique.mockResolvedValue(userForReset);
      prismaService.user.update.mockResolvedValue({
        ...userForReset,
        isResetPassword: true,
        resetPasswordToken: 'mock-cuid-123',
      });

      // Act
      const result = await service.resetUserPasswordRequest({ email });

      // Assert
      expect(result).toEqual({
        error: false,
        message: 'Please check your emails to reset your password.',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: {
          isResetPassword: true,
          firstName: true,
          email: true,
        },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email },
        data: {
          isResetPassword: true,
          resetPasswordToken: 'mock-cuid-123',
        },
      });
      expect(mailerService.sendRequestedPasswordEmail).toHaveBeenCalledWith({
        firstName: userForReset.firstName,
        recipient: userForReset.email,
        token: 'mock-cuid-123',
      });
    });

    it('should fail when user does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.resetUserPasswordRequest({ email });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'The user does not exist.',
      });
    });

    it('should fail when reset is already in progress', async () => {
      // Arrange
      const userWithReset = {
        ...mockUser,
        isResetPassword: true,
      };
      prismaService.user.findUnique.mockResolvedValue(userWithReset);

      // Act
      const result = await service.resetUserPasswordRequest({ email });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'A password reset request is already in progress.',
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('verifyResetPasswordToken', () => {
    const token = 'valid-token-123';

    it('should successfully verify a valid token', async () => {
      // Arrange
      const userWithReset = {
        ...mockUser,
        isResetPassword: true,
        resetPasswordToken: token,
      };
      prismaService.user.findUnique.mockResolvedValue(userWithReset);

      // Act
      const result = await service.verifyResetPasswordToken({ token });

      // Assert
      expect(result).toEqual({
        error: false,
        message: 'The token is valid and can be used.',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { resetPasswordToken: token },
      });
    });

    it('should fail when token does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.verifyResetPasswordToken({ token });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'The user does not exist.',
      });
    });

    it('should fail when no reset is in progress', async () => {
      // Arrange
      const userWithoutReset = {
        ...mockUser,
        isResetPassword: false,
        resetPasswordToken: token,
      };
      prismaService.user.findUnique.mockResolvedValue(userWithoutReset);

      // Act
      const result = await service.verifyResetPasswordToken({ token });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'A password reset request is not in progress.',
      });
    });
  });

  describe('resetUserPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-token-123',
      password: 'NewPassword123!',
    };

    it('should successfully reset user password', async () => {
      // Arrange
      const userWithReset = {
        ...mockUser,
        isResetPassword: true,
        resetPasswordToken: resetPasswordDto.token,
      };
      prismaService.user.findUnique.mockResolvedValue(userWithReset);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      prismaService.user.update.mockResolvedValue({
        ...userWithReset,
        isResetPassword: false,
        password: 'newHashedPassword',
      });

      // Act
      const result = await service.resetUserPassword({ resetPasswordDto });

      // Assert
      expect(result).toEqual({
        error: false,
        message: 'Votre mot de passe a bien été changé.',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { resetPasswordToken: resetPasswordDto.token },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(
        resetPasswordDto.password,
        10,
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { resetPasswordToken: resetPasswordDto.token },
        data: {
          isResetPassword: false,
          password: 'newHashedPassword',
        },
      });
    });

    it('should fail when token does not exist', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.resetUserPassword({ resetPasswordDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'The user does not exist.',
      });
    });

    it('should fail when no reset is in progress', async () => {
      // Arrange
      const userWithoutReset = {
        ...mockUser,
        isResetPassword: false,
        resetPasswordToken: resetPasswordDto.token,
      };
      prismaService.user.findUnique.mockResolvedValue(userWithoutReset);

      // Act
      const result = await service.resetUserPassword({ resetPasswordDto });

      // Assert
      expect(result).toEqual({
        error: true,
        message: 'A password reset request is not in progress.',
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
