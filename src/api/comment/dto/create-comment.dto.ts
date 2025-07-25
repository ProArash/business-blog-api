import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
	@IsNotEmpty()
	content: string;

	@IsNotEmpty()
	status: string;

	@IsNotEmpty()
	postId: string;

	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	email: string;
}
