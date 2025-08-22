import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { MailerService } from '../mailer.service';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Role } from './dto/register.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthController', () => {
  let controller: AuthController;
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

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token-123'),
    };

    const mockMailerService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendRequestedPasswordEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockUsersService = {
      getUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    prismaService = mockPrismaService;
    jwtService = mockJwtService;

    // Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login (integration test)', () => {
    it('should successfully login user with valid credentials through full flow', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock des dépendances
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act - Test du controller qui appelle le service
      const result = await controller.login(loginDto);

      // Assert - Vérification du résultat complet
      expect(result).toEqual({
        access_token: 'mock-jwt-token-123',
      });

      // Vérification que toute la chaîne d'appels a été respectée
      const findUniqueMock = prismaService.user.findUnique;
      const compareMock = mockBcrypt.compare;
      const signMock = jwtService.sign;
      
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(compareMock).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(signMock).toHaveBeenCalledWith({
        userId: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});
