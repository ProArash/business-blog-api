import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../user/user.roles';

export const ROLES_KEYS = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEYS, roles);
