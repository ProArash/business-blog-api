import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateContactUsDto } from './dto/create-contact_us.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactUsEntity } from './entities/contact_us.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContactUsService {
	constructor(
		@InjectRepository(ContactUsEntity)
		private repo: Repository<ContactUsEntity>,
	) {}

	async create(createContactUsDto: CreateContactUsDto) {
		return await this.repo.create(createContactUsDto).save();
	}

	async findAll(pageNumber: number) {
		if (!pageNumber)
			throw new BadRequestException('Please provide pageNumber.');
		const totalCount = await this.repo.count();
		const limit = 20;
		const skip = (pageNumber - 1) * limit;
		const contacts = await this.repo.find({
			take: limit,
			skip,
		});

		return {
			count: limit,
			totalCount,
			contacts,
		};
	}

	async findOne(id: number) {
		if (!id) throw new BadRequestException('Please provide id.');
		const contact = await this.repo.findOne({
			where: {
				id,
			},
		});
		if (!contact) throw new NotFoundException('Contact form not found.');
		return contact;
	}

	async remove(id: number) {
		if (!id) throw new BadRequestException('Please provide id.');
		const contact = await this.findOne(id);
		await this.repo.delete(contact.id);
		return true;
	}
}
