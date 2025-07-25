import { IsNotEmpty } from 'class-validator';

export class CreatePortfolioDto {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	description: string;

	@IsNotEmpty()
	imageUrl: string;

	@IsNotEmpty()
	url: string;
}
