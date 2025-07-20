import { SetMetadata } from '@nestjs/common';
import { Role } from 'generated/prisma';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const IsAdmin = () => Roles(Role.ADMIN);
export const IsProfessional = () => Roles(Role.PROFESSIONAL);
export const IsPatient = () => Roles(Role.PATIENT);