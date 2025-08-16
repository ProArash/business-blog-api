import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CommentStatus } from '../entities/comment.entity';

export class CreateCommentDto {
	@ApiProperty()
	@IsNotEmpty()
	content: string;

	@ApiProperty()
	@IsNotEmpty()
	status: CommentStatus;

	@ApiProperty()
	@IsNotEmpty()
	postId: number;

	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	email: string;
}
