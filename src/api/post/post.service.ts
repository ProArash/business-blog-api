import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(PostEntity)
		private postRepo: Repository<PostEntity>,
		private userService: UserService,
	) {}
	async create(createPostDto: CreatePostDto, username: string) {
		const user = await this.userService.getUserByUsername(username);
		return await this.postRepo
			.create({
				...createPostDto,
				owner: user,
			})
			.save();
	}

	async findAll() {
		return await this.postRepo.find();
	}
}
