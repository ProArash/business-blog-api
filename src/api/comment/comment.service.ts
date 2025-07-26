import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity, CommentStatus } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { PostService } from '../post/post.service';

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(CommentEntity)
		private repo: Repository<CommentEntity>,
		private postService: PostService,
	) {}

	async create(createCommentDto: CreateCommentDto) {
		const post = await this.postService.getPostById(+createCommentDto.postId);
		return await this.repo
			.create({
				content: createCommentDto.content,
				status: CommentStatus.PENDING,
				post,
			})
			.save();
	}

	async findAll(postId: number) {
		const totalCount = await this.repo.count();
		const comments = await this.repo.find({
			where: {
				post: {
					id: postId,
				},
			},
			select: {
				content: true,
				name: true,
				updatedAt: true,
			},
		});
		return {
			totalCount,
			comments,
		};
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return true;
	}
}
