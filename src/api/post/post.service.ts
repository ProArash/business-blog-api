import { Injectable, NotFoundException } from '@nestjs/common';
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
		const user = await this.userService.getUserByEmail(username);
		return await this.postRepo
			.create({
				...createPostDto,
				author: user,
			})
			.save();
	}

	async findAll(pageNumber: number) {
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		return await this.postRepo.find({
			take: limit,
			skip,
		});
	}

	async getPostById(postId: number) {
		const post = await this.postRepo.findOne({
			where: {
				id: postId,
			},
		});
		if (!post) throw new NotFoundException('Post not found.');
		return post;
	}
}
