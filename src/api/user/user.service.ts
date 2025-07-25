import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private userRepo: Repository<UserEntity>,
	) {}

	async create(createUserDto: CreateUserDto): Promise<UserEntity> {
		const existingUser = await this.userRepo.findOne({
			where: { email: createUserDto.email },
		});
		if (existingUser) {
			throw new ConflictException('User with this email already exists.');
		}

		const salt = await bcryptjs.genSalt();
		const hashedPassword = await bcryptjs.hash(createUserDto.password, salt);

		const user = this.userRepo.create({
			...createUserDto,
			password: hashedPassword,
		});

		const savedUser = await this.userRepo.save(user);
		return savedUser;
	}

	async findAll(pageNumber: number = 1): Promise<UserEntity[]> {
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		return this.userRepo.find({
			take: limit,
			skip,
			order: { createdAt: 'DESC' },
		});
	}

	async findOneById(id: number): Promise<UserEntity> {
		const user = await this.userRepo.findOne({ where: { id } });
		if (!user) {
			throw new NotFoundException(`User with ID #${id} not found.`);
		}
		return user;
	}

	async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
		const user = await this.findOneById(id);

		if (updateUserDto.email && updateUserDto.email !== user.email) {
			const existing = await this.userRepo.findOne({
				where: { email: updateUserDto.email, id: Not(id) },
			});
			if (existing) {
				throw new ConflictException(
					'The new email is already in use by another user.',
				);
			}
		}

		if (updateUserDto.password) {
			const salt = await bcryptjs.genSalt();
			updateUserDto.password = await bcryptjs.hash(
				updateUserDto.password,
				salt,
			);
		}

		Object.assign(user, updateUserDto);
		const updatedUser = await this.userRepo.save(user);
		return this.findOneById(updatedUser.id);
	}

	async remove(id: number): Promise<{ message: string }> {
		const result = await this.userRepo.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`User with ID #${id} not found.`);
		}
		return { message: `User #${id} has been deleted successfully.` };
	}

	async getUserByEmail(email: string): Promise<UserEntity> {
		const user = await this.userRepo.findOne({
			where: { email },
			select: [
				'id',
				'name',
				'email',
				'password',
				'roles',
				'createdAt',
				'updatedAt',
			],
		});
		if (!user) {
			throw new NotFoundException('User not found.');
		}
		return user;
	}
}
