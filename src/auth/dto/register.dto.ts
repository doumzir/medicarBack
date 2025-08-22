import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,

  MinLength,
} from 'class-validator';

export enum Role {
  PATIENT = 'PATIENT',
  PROFESSIONAL = 'PROFESSIONAL',
}
 
export class RegisterDto {
  @IsString({ message: 'You need to provide a first name' })
  firstName!: string;

  @IsString({ message: 'You need to provide a last name' })
  lastName!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
  
  @IsOptional()
  @IsInt()
  @Max(10)
  healthEntry?: number;

  /*   @IsObject()
  @IsOptional()
  reminder: {
    title: string;
    description?: string;
    type: string;
  }; */
}
