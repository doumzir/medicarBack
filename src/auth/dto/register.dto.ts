import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum Role {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL',
}

export class RegisterDto {
  @IsString({ message: 'You need to provide a first name' })
  firstName: string;

  @IsString({ message: 'You need to provide a last name' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  /*   @IsObject()
  @IsOptional()
  reminder: {
    title: string;
    description?: string;
    type: string;
  }; */

  @IsEnum(Role)
  role: Role;
}
