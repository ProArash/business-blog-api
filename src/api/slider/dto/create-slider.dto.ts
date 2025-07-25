import { IsNotEmpty } from 'class-validator';

export class CreateSliderDto {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	subtitle: string;

	@IsNotEmpty()
	link: string;

	@IsNotEmpty()
	order: number;

	@IsNotEmpty()
	status: boolean;
}
