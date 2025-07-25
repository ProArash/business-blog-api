import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcryptjs from 'bcryptjs';
import { ICookies } from './jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserPayload } from './user.payload';
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
		let user: UserEntity | null;
		if (users.length == 0) {
			const pwd = await bcryptjs.hash(authDto.password, 10);
			user = await this.userRepo
				.create({
					...authDto,
					password: pwd,
					roles: [UserRoles.ADMIN, UserRoles.AUTHOR],
				})
				.save();
			const payload: UserPayload = {
				id: user.id,
				name: user.name,
				email: user.email,
			};
			const token = await this.jwtService.signAsync(payload);
			return {
				token,
			};
		} else {
			user = await this.userRepo.findOne({
				where: {
					email: authDto.email,
				},
				select: {
					password: true,
					name: true,
					email: true,
					id: true,
				},
			});
			if (!user) throw new NotFoundException('User not found.');
			const result = await bcryptjs.compare(authDto.password, user.password);
			if (!result) throw new BadRequestException('Invalid credentials.');
			const payload: UserPayload = {
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
	async getCurrentProfile(userId: number) {
		const user = await this.userRepo.findOne({
			where: {
				id: userId,
			},
		});
		if (!user) throw new NotFoundException('User not found');
		return user;
	}
}
