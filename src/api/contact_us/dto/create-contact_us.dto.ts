import { IsNotEmpty } from 'class-validator';

export class CreateContactUsDto {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	subject: string;

	@IsNotEmpty()
	message: string;
}
