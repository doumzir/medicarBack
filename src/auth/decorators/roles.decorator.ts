import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
  PATIENT = 'PATIENT',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Décorateur spécifique pour admin
export const IsAdmin = () => Roles(UserRole.ADMIN);

// Décorateur pour professionnel de santé
export const IsProfessional = () => Roles(UserRole.PROFESSIONAL);

// Décorateur pour patient
export const IsPatient = () => Roles(UserRole.PATIENT);
