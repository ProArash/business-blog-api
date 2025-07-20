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

	async getUserByUsername(username: string) {
		const user = await this.userRepo.findOne({
			where: {
				username,
			},
		});
		if (!user) throw new NotFoundException('نام کاربری یافت نشد.');
		return user;
	}
}
