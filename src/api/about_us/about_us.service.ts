import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity, MediaType } from '../../utils/media.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { AboutUsEntity } from './entities/about_us.entity';
import { CreateAboutUsDto } from './dto/create-about_us.dto';
import { UpdateAboutUsDto } from './dto/update-about_us.dto';

@Injectable()
export class AboutUsService {
	constructor(
		@InjectRepository(AboutUsEntity)
		private aboutUsRepo: Repository<AboutUsEntity>,
		@InjectRepository(MediaEntity)
		private mediaRepo: Repository<MediaEntity>,
	) {}

	async create(createDto: CreateAboutUsDto, file: Express.Multer.File) {
		const existing = await this.aboutUsRepo.find();
		if (existing.length > 0) {
			throw new ConflictException(
				'An "About Us" entry already exists. Please update it instead.',
			);
		}

		const media = new MediaEntity();
		media.mediaUrl = `/uploads/${file.filename}`;
		media.mediaType = MediaType.IMAGE;

		const aboutUs = this.aboutUsRepo.create({
			content: createDto.content,
			media,
		});

		return this.aboutUsRepo.save(aboutUs);
	}

	async find() {
		const aboutUs = await this.aboutUsRepo.findOne({ where: {} });
		if (!aboutUs) {
			throw new NotFoundException('No "About Us" entry found.');
		}
		return aboutUs;
	}

	async update(updateDto: UpdateAboutUsDto, file?: Express.Multer.File) {
		const aboutUs = await this.find();

		if (file) {
			if (aboutUs.media && aboutUs.media.mediaUrl) {
				await unlink(join(process.cwd(), aboutUs.media.mediaUrl)).catch((err) =>
					console.error(`Failed to delete old file: ${err}`),
				);
				aboutUs.media.mediaUrl = `/uploads/${file.filename}`;
			} else {
				const newMedia = new MediaEntity();
				newMedia.mediaUrl = `/uploads/${file.filename}`;
				newMedia.mediaType = MediaType.IMAGE;
				aboutUs.media = newMedia;
			}
		}

		Object.assign(aboutUs, updateDto);
		return this.aboutUsRepo.save(aboutUs);
	}

	async remove(id: number) {
		const aboutUs = await this.aboutUsRepo.findOne({
			where: { id },
			relations: ['media'],
		});

		if (!aboutUs) {
			throw new NotFoundException(`About Us entry with ID #${id} not found.`);
		}

		if (aboutUs.media) {
			if (aboutUs.media.mediaUrl) {
				await unlink(join(process.cwd(), aboutUs.media.mediaUrl)).catch((err) =>
					console.error(`Failed to delete physical file: ${err}`),
				);
			}
			await this.mediaRepo.remove(aboutUs.media);
		}
		await this.aboutUsRepo.remove(aboutUs);

		return { message: `About Us entry #${id} has been deleted successfully.` };
	}
}
