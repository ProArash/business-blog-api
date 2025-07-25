import { IsNotEmpty } from 'class-validator';

export class CreateAboutUsDto {
	@IsNotEmpty()
	content: string;

	imageUrl: string;
}
