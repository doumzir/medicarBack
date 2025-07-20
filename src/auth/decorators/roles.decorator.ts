import { SetMetadata } from '@nestjs/common';
import { Role } from 'generated/prisma';



export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Décorateur spécifique pour admin
export const IsAdmin = () => Roles(Role.ADMIN);

// Décorateur pour professionnel de santé
export const IsProfessional = () => Roles(Role.PROFESSIONAL);

// Décorateur pour patient
export const IsPatient = () => Roles(Role.PATIENT);
