import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepo: Repository<UserEntity>,
	) {}

	async getUserByEmail(email: string) {
		const user = await this.userRepo.findOne({
			where: {
				email,
			},
		});
		if (!user) throw new NotFoundException('Username not found.');
		return user;
	}
}
