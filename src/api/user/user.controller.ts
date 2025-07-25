import {
	Controller,
	Body,
	Post,
	Get,
	Patch,
	Delete,
	Query,
	UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoles } from './user.roles';

@Controller('user')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoles.ADMIN)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('create')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password', 'roles'],
			properties: {
				email: { type: 'string', example: 'new.admin@example.com' },
				password: {
					type: 'string',
					format: 'password',
					example: 'strongPassword123',
				},
				name: { type: 'string', example: 'John Doe', nullable: true },
				roles: {
					type: 'array',
					items: { type: 'string', enum: Object.values(UserRoles) },
				},
			},
		},
	})
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	@Get('getAll')
	findAll(@Query('page') page: string) {
		return this.userService.findAll(+page || 1);
	}

	@Get('getById')
	findOne(@Query('id') id: string) {
		return this.userService.findOneById(+id);
	}

	@Patch('updateById')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				email: { type: 'string', nullable: true },
				password: { type: 'string', format: 'password', nullable: true },
				name: { type: 'string', nullable: true },
				roles: {
					type: 'array',
					items: { type: 'string', enum: Object.values(UserRoles) },
					nullable: true,
				},
			},
		},
	})
	update(@Query('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(+id, updateUserDto);
	}

	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.userService.remove(+id);
	}
}
