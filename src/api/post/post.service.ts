import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity, PostStatus } from './entities/post.entity';
import { Not, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { MediaEntity, MediaType } from '../../utils/media.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(PostEntity)
		private postRepo: Repository<PostEntity>,
		private userService: UserService,
	) {}
	async create(
		createPostDto: CreatePostDto,
		email: string,
		file: Express.Multer.File,
	) {
		const user = await this.userService.getUserByEmail(email);
		let post = await this.postRepo.findOne({
			where: {
				slug: createPostDto.slug,
			},
		});
		if (post) throw new ConflictException('The slug is duplcate.');

		const media = new MediaEntity();
		media.mediaUrl = `/uploads/${file.filename}`;
		media.mediaType = MediaType.IMAGE;
		media.user = user;

		post = this.postRepo.create({
			...createPostDto,
			author: user,
			media: media,
		});

		if (post.status === PostStatus.PUBLISHED) {
			post.publishedAt = new Date();
		}

		return await this.postRepo.save(post);
	}

	async findAll(pageNumber: number) {
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		const totalCount = await this.postRepo.count();
		const posts = await this.postRepo.find({
			take: limit,
			skip,
			relations: ['author', 'media'],
			order: {
				createdAt: 'DESC',
			},
		});
		return {
			count: limit,
			totalCount,
			posts,
		};
	}

	async getPostById(postId: number) {
		const post = await this.postRepo.findOne({
			where: { id: postId },
			relations: ['author', 'media', 'comments'],
		});
		if (!post) throw new NotFoundException('Post not found.');
		return post;
	}
	async update(
		id: number,
		updatePostDto: UpdatePostDto,
		file?: Express.Multer.File,
	) {
		const post = await this.getPostById(id);
		const originalStatus = post.status;

		if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
			const existing = await this.postRepo.findOne({
				where: { slug: updatePostDto.slug, id: Not(id) },
			});
			if (existing) {
				throw new ConflictException('The new slug is already in use.');
			}
		}

		if (file) {
			if (post.media && post.media.mediaUrl) {
				await unlink(join(process.cwd(), post.media.mediaUrl)).catch((err) =>
					console.error(`Failed to delete old file: ${err}`),
				);
				post.media.mediaUrl = `/uploads/${file.filename}`;
			} else {
				const newMedia = new MediaEntity();
				newMedia.mediaUrl = `/uploads/${file.filename}`;
				newMedia.mediaType = MediaType.IMAGE;
				newMedia.user = post.author;
				post.media = newMedia;
			}
		}

		Object.assign(post, updatePostDto);

		if (
			post.status === PostStatus.PUBLISHED &&
			originalStatus !== PostStatus.PUBLISHED
		) {
			post.publishedAt = new Date();
		}

		return this.postRepo.save(post);
	}
	async remove(id: number) {
		const post = await this.getPostById(id);

		if (post.media && post.media.mediaUrl) {
			await unlink(join(process.cwd(), post.media.mediaUrl)).catch((err) =>
				console.error(`Failed to delete physical file: ${err}`),
			);
		}
		await this.postRepo.remove(post);

		return { message: `Post #${id} has been deleted successfully.` };
	}
}
