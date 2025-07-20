import { Body, Controller, Post, Res, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signIn')
	async signIn(
		@Body(new ValidationPipe()) authDto: CreateAuthDto,
		@Res() res: Response,
	) {
		const cookies = await this.authService.signIn(authDto);
		res.cookie('token', cookies.token, {
			httpOnly: true,
			path: '/',
			secure: process.env.ENV == 'dev' ? false : true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
		return res.status(200).json({
			message: 'با موفقیت وارد شدید',
		});
	}
}
