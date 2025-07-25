import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioEntity } from './entities/portfolio.entity';
import { Repository } from 'typeorm';
import { MediaEntity, MediaType } from '../../utils/media.entity';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class PortfolioService {
	constructor(
		@InjectRepository(PortfolioEntity)
		private portfolioRepo: Repository<PortfolioEntity>,
	) {}

	async create(
		createPortfolioDto: CreatePortfolioDto,
		file: Express.Multer.File,
	) {
		const media = new MediaEntity();
		media.mediaUrl = `/uploads/${file.filename}`;
		media.mediaType = MediaType.IMAGE;

		const portfolioItem = this.portfolioRepo.create({
			...createPortfolioDto,
			media,
		});

		return this.portfolioRepo.save(portfolioItem);
	}

	findAll(pageNumber: number) {
		const limit = 10;
		const skip = (pageNumber - 1) * limit;
		return this.portfolioRepo.find({ relations: ['media'], take: limit, skip });
	}

	async findOne(id: number) {
		const portfolioItem = await this.portfolioRepo.findOne({
			where: { id },
			relations: ['media'],
		});
		if (!portfolioItem)
			throw new NotFoundException(`Portfolio item #${id} not found`);
		return portfolioItem;
	}

	async update(
		id: number,
		updatePortfolioDto: UpdatePortfolioDto,
		file?: Express.Multer.File,
	) {
		const portfolioItem = await this.findOne(id);

		if (file) {
			// Check if a media entity is already associated
			if (portfolioItem.media) {
				// If yes, delete the old physical file
				await unlink(join(process.cwd(), portfolioItem.media.mediaUrl)).catch(
					(err) => console.error(`Failed to delete old file: ${err}`),
				);
				// And UPDATE the URL on the EXISTING media object
				portfolioItem.media.mediaUrl = `/uploads/${file.filename}`;
			} else {
				// If no, create a NEW media entity and associate it
				const newMedia = new MediaEntity();
				newMedia.mediaUrl = `/uploads/${file.filename}`;
				newMedia.mediaType = MediaType.IMAGE;
				portfolioItem.media = newMedia;
			}
		}

		// Apply other DTO changes and save
		Object.assign(portfolioItem, updatePortfolioDto);
		return this.portfolioRepo.save(portfolioItem);
	}

	async remove(id: number) {
		const portfolioItem = await this.findOne(id);

		if (portfolioItem.media?.mediaUrl) {
			await unlink(join(process.cwd(), portfolioItem.media.mediaUrl)).catch(
				(err) => console.error(err),
			);
		}

		await this.portfolioRepo.remove(portfolioItem);
		return { message: `Portfolio item #${id} deleted successfully` };
	}
}
