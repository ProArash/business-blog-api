import { IsNotEmpty } from 'class-validator';
import { PostStatus } from '../entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
	@ApiProperty()
	@IsNotEmpty()
	tags: string[];

	@ApiProperty()
	@IsNotEmpty()
	title: string;

	@ApiProperty()
	@IsNotEmpty()
	slug: string;

	@ApiProperty()
	@IsNotEmpty()
	content: string;

	@ApiProperty()
	status: PostStatus;
}
