import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
	@IsNotEmpty()
	tag: string;

	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	description: string;

	imageUrl: string;
}
