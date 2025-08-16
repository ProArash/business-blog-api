import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
	ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Request, Response } from 'express';
import { ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserPayload } from './user.payload';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signIn')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['email', 'password'],
			properties: {
				email: {
					type: 'string',
					example: 'user@example.com',
				},
				password: {
					type: 'string',
					format: 'password',
					example: 'yourStrongPassword123',
				},
				name: {
					type: 'string',
					description: 'Optional name for the user.',
					nullable: true,
					example: 'John Doe',
				},
			},
		},
	})
	async signIn(
		@Body(new ValidationPipe()) authDto: CreateAuthDto,
		@Res() res: Response,
	) {
		const cookies = await this.authService.signIn(authDto);
		res.cookie('token', cookies.token, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: process.env.ENV == 'dev' ? false : true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		return res.status(200).json({
			message: 'Logged in successfuly.',
		});
	}

	@UseGuards(AuthGuard('jwt'))
	@Get('profile')
	async getCurrentUser(@Req() req: Request) {
		const user = req.user as UserPayload;
		return await this.authService.getCurrentProfile(+user.id);
	}
}
