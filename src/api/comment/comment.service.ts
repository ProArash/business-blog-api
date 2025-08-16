import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity, CommentStatus } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { PostService } from '../post/post.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
	constructor(
		@InjectRepository(CommentEntity)
		private repo: Repository<CommentEntity>,
		private postService: PostService,
	) {}

	async create(createCommentDto: CreateCommentDto) {
		const post = await this.postService.getPostById(createCommentDto.postId);
		return await this.repo
			.create({
				...createCommentDto,
				content: createCommentDto.content,
				status: CommentStatus.PENDING,
				post,
			})
			.save();
	}

	async findAll(postId: number, pageNumber: number) {
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		const totalCount = await this.repo.count();
		const comments = await this.repo.find({
			where: {
				post: {
					id: postId,
				},
				status: CommentStatus.CONFIRMED,
			},
			take: limit,
			skip,
		});
		return {
			totalCount,
			comments,
		};
	}
	async findAllAdmin(pageNumber: number) {
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		const totalCount = await this.repo.count();
		const comments = await this.repo.find({
			take: limit,
			skip,
		});
		return {
			totalCount,
			comments,
		};
	}

	async update(id: number, updateCommentDto: UpdateCommentDto) {
		const comment = await this.repo.findOneBy({ id });
		if (!comment) {
			throw new NotFoundException(`Comment with ID #${id} not found`);
		}
		Object.assign(comment, updateCommentDto);

		return this.repo.save(comment);
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return true;
	}
}
