import { IsNotEmpty, IsOptional } from 'class-validator';
import { UserRoles } from '../user.roles';

export class CreateUserDto {
	@IsOptional()
	name?: string;

	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsNotEmpty()
	roles: UserRoles[];
}
