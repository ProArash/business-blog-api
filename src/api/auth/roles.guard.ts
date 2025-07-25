import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEYS } from './roles.decorator';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { UserRoles } from '../user/user.roles';
import { UserPayload } from './user.payload';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private userService: UserService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<UserRoles[]>(
			ROLES_KEYS,
			[context.getHandler(), context.getClass()],
		);
		const request: Request = context.switchToHttp().getRequest();
		const { email } = request.user as UserPayload;
		const userData = await this.userService.getUserByEmail(email);
		if (!requiredRoles) return true;
		const hasPermission = userData.roles.some((role) =>
			requiredRoles.includes(role),
		);
		if (!hasPermission)
			throw new ForbiddenException('به این بخش دسترسی ندارید');
		return true;
	}
}
