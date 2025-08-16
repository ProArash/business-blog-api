import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SliderEntity } from './entities/slider.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { MediaEntity, MediaType } from '../../utils/media.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class SliderService {
	constructor(
		@InjectRepository(SliderEntity)
		private repo: Repository<SliderEntity>,
		private userService: UserService,
		@InjectRepository(MediaEntity)
		private mediaRepo: Repository<MediaEntity>,
	) {}

	async create(
		createSliderDto: CreateSliderDto,
		file: Express.Multer.File,
		email: string,
	) {
		const user = await this.userService.getUserByEmail(email);

		const media = new MediaEntity();
		media.mediaUrl = `/uploads/${file.filename}`;
		media.mediaType = MediaType.IMAGE;
		media.user = user;

		const slider = this.repo.create({
			...createSliderDto,
			media: media,
		});

		return this.repo.save(slider);
	}

	async findAll(pageNumber: number) {
		const limit = 10;
		const skip = (pageNumber - 1) * limit;
		const totalCount = await this.repo.count();
		const sliders = await this.repo.find({
			take: limit,
			skip,
			relations: ['media'],
			order: {
				order: 'ASC',
			},
		});
		return {
			count: sliders.length,
			totalCount,
			sliders,
		};
	}

	async findOne(id: number) {
		const slider = await this.repo.findOne({
			where: { id },
			relations: ['media'],
		});
		if (!slider) throw new NotFoundException('Slider not found.');
		return slider;
	}

	async update(
		updateSliderDto: UpdateSliderDto,
		sliderId: number,
		file: Express.Multer.File,
	) {
		const slider = await this.findOne(sliderId);

		if (file) {
			if (slider.media && slider.media.mediaUrl) {
				try {
					await unlink(join(process.cwd(), slider.media.mediaUrl));
					await this.mediaRepo.remove(slider.media);
				} catch (error) {
					console.error(
						`Failed to delete old file or DB entry: ${slider.media.mediaUrl}`,
						error,
					);
				}
			}

			const newMedia = new MediaEntity();
			newMedia.mediaUrl = `/uploads/${file.filename}`;
			newMedia.mediaType = MediaType.IMAGE;
			// newMedia.user = ...;
			slider.media = newMedia;
		}

		Object.assign(slider, updateSliderDto);

		return this.repo.save(slider);
	}

	async remove(id: number): Promise<boolean> {
		const slider = await this.findOne(id);

		if (slider.media && slider.media.mediaUrl) {
			try {
				await unlink(join(process.cwd(), slider.media.mediaUrl));
			} catch (error) {
				console.error(
					`Failed to delete file from storage: ${slider.media.mediaUrl}`,
					error,
				);
			}
		}

		await this.repo.remove(slider);

		return true;
	}
}
