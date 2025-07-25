import {
	Controller,
	Get,
	Post,
	Body,
	Delete,
	Query,
	ValidationPipe,
} from '@nestjs/common';
import { ContactUsService } from './contact_us.service';
import { CreateContactUsDto } from './dto/create-contact_us.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('contactUs')
export class ContactUsController {
	constructor(private readonly contactUsService: ContactUsService) {}

	@Post('newContact')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['name', 'email', 'subject', 'message'],
			properties: {
				name: {
					type: 'string',
					example: 'Jane Doe',
				},
				email: {
					type: 'string',
					format: 'email',
					example: 'jane.doe@example.com',
				},
				subject: {
					type: 'string',
					example: 'Question about your services',
				},
				message: {
					type: 'string',
					example: 'I would like to know more about...',
				},
			},
		},
	})
	create(@Body(new ValidationPipe()) createContactUsDto: CreateContactUsDto) {
		return this.contactUsService.create(createContactUsDto);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.contactUsService.findAll(+pageNumber);
	}

	@Get('getById')
	findOne(@Query('id') id: string) {
		return this.contactUsService.findOne(+id);
	}

	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.contactUsService.remove(+id);
	}
}
