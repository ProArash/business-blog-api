import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSliderDto {
	@ApiProperty()
	@IsNotEmpty()
	title: string;

	@ApiProperty()
	@IsNotEmpty()
	subtitle: string;

	@ApiProperty()
	@IsNotEmpty()
	link: string;

	@ApiProperty()
	@IsNotEmpty()
	order: number;

	@ApiProperty()
	@IsNotEmpty()
	status: boolean;
}
