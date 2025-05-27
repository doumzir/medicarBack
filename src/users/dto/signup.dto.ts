import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export enum Role {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL',
}

export class SignupDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
