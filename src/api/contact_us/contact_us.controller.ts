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

@Controller('contactUs')
export class ContactUsController {
	constructor(private readonly contactUsService: ContactUsService) {}

	@Post('newContact')
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
