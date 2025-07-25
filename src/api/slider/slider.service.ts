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
	) {}

	async create(
		createSliderDto: CreateSliderDto,
		files: Array<Express.Multer.File>,
		email: string,
	) {
		const user = await this.userService.getUserByEmail(email);

		const mediaEntities = files.map((file) => {
			const media = new MediaEntity();
			media.mediaUrl = `/uploads/${file.filename}`;
			media.mediaType = MediaType.IMAGE;
			media.user = user;
			return media;
		});

		const slider = this.repo.create({
			...createSliderDto,
			medias: mediaEntities,
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
			relations: ['medias'],
		});
		return {
			count: limit,
			totalCount,
			sliders,
		};
	}

	async findOne(id: number) {
		const slider = await this.repo.findOne({
			where: { id },
			relations: ['medias'],
		});
		if (!slider) throw new NotFoundException('Slider not found.');
		return slider;
	}

	async update(
		updateSliderDto: UpdateSliderDto,
		sliderId: number,
		files: Array<Express.Multer.File>,
	) {
		const slider = await this.findOne(sliderId);

		if (files && files.length > 0) {
			for (const media of slider.medias) {
				try {
					await unlink(join(process.cwd(), media.mediaUrl));
				} catch (error) {
					console.error(`Failed to delete old file: ${media.mediaUrl}`, error);
				}
			}
			slider.medias = files.map((file) => {
				const media = new MediaEntity();
				media.mediaUrl = `/uploads/${file.filename}`;
				media.mediaType = MediaType.IMAGE;
				return media;
			});
		}

		Object.assign(slider, updateSliderDto);

		return this.repo.save(slider);
	}

	async remove(id: number) {
		const slider = await this.findOne(id);

		for (const media of slider.medias) {
			try {
				await unlink(join(process.cwd(), media.mediaUrl));
			} catch (error) {
				console.error(`Failed to delete file: ${media.mediaUrl}`, error);
			}
		}

		const result = await this.repo.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException('Slider not found.');
		}
		return true;
	}
}
