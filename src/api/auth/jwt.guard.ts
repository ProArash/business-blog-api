import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface ICookies {
	token: string;
}

export interface IUserPayload {
	id: number;
	email: string;
	name: string;
}

@Injectable()
export class JwtAuthGuard extends PassportStrategy(Strategy, 'jwt') {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(req: Request) => {
					const cookies: ICookies = req.cookies as ICookies;
					let token = '';
					if (cookies.token) token = cookies.token;
					else throw new UnauthorizedException('Please login to you account.');
					return token;
				},
			]),
			secretOrKey: configService.get<string>('SECRET') ?? 'secret',
			ignoreExpiration: false,
		});
	}
	validate(payload: IUserPayload): IUserPayload {
		return payload;
	}
}
