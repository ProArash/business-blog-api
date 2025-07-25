import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SliderEntity } from './entities/slider.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { MediaEntity } from '../../utils/media.entity';

@Injectable()
export class SliderService {
	constructor(
		@InjectRepository(SliderEntity)
		private repo: Repository<SliderEntity>,
		@InjectRepository(MediaEntity)
		private fileRepo: Repository<MediaEntity>,
		private userService: UserService,
	) {}

	async create(
		createSliderDto: CreateSliderDto,
		images: string[],
		email: string,
	) {
		const user = await this.userService.getUserByEmail(email);
		return await this.repo
			.create({
				...createSliderDto,
				images,
			})
			.save();
	}

	async findAll(pageNumber: number) {
		const limit = 10;
		const skip = (pageNumber - 1) * limit;
		return await this.repo.find({
			take: limit,
			skip,
		});
	}

	async findOne(id: number) {
		const slider = await this.repo.findOne({
			where: {
				id,
			},
		});
		if (!slider) throw new NotFoundException('Slider not found.');
		return slider;
	}

	async update(
		updateSliderDto: UpdateSliderDto,
		sliderId: number,
		images: string[],
	) {
		return await this.repo.update(sliderId, {
			...updateSliderDto,
			images,
		});
	}

	async remove(id: number) {
		await this.repo.delete(id);
		return true;
	}
}
