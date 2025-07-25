import { IsNotEmpty } from 'class-validator';
import { PostStatus } from '../entities/post.entity';

export class CreatePostDto {
	@IsNotEmpty()
	tags: string[];

	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	slug: string;

	@IsNotEmpty()
	content: string;

	status: PostStatus;
}
