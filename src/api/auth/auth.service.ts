import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcryptjs from 'bcryptjs';
import { ICookies, IUserPayload } from './jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoles } from '../user/user.roles';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		@InjectRepository(UserEntity)
		private userRepo: Repository<UserEntity>,
	) {}

	async signIn(authDto: CreateAuthDto): Promise<ICookies> {
		const users = await this.userRepo.find();
		let user = await this.userRepo.findOne({
			where: {
				email: authDto.email,
			},
			select: {
				id: true,
				email: true,
				password: true,
				name: true,
			},
		});

		if (!user) {
			user = await this.userRepo
				.create({
					email: authDto.email,
					password: await bcryptjs.hash(authDto.password, 10),
					roles:
						users.length == 0
							? [UserRoles.ADMIN, UserRoles.AUTHOR]
							: [UserRoles.AUTHOR],
					name: authDto.name ?? null,
				})
				.save();
		}
		const result = await bcryptjs.compare(authDto.password, user.password);
		if (!result) throw new BadRequestException('Invalid password.');

		const payload: IUserPayload = {
			id: user.id,
			name: user.name,
			email: user.email,
		};

		const token = await this.jwtService.signAsync(payload);
		return {
			token,
		};
	}
}
