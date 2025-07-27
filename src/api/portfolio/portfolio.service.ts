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
		@InjectRepository(MediaEntity)
		private mediaRepo: Repository<MediaEntity>,
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

	async findAll(pageNumber: number) {
		const limit = 10;
		const skip = (pageNumber - 1) * limit;
		const [items, totalCount] = await this.portfolioRepo.findAndCount({
			relations: ['media'],
			take: limit,
			skip,
			order: { createdAt: 'DESC' },
		});

		return {
			count: items.length,
			totalCount,
			items,
		};
	}

	async findOne(id: number) {
		const portfolioItem = await this.portfolioRepo.findOne({
			where: { id },
			relations: ['media'],
		});
		if (!portfolioItem) {
			throw new NotFoundException(`Portfolio item #${id} not found`);
		}
		return portfolioItem;
	}

	async update(
		id: number,
		updatePortfolioDto: UpdatePortfolioDto,
		file?: Express.Multer.File,
	) {
		const portfolioItem = await this.findOne(id);

		if (file) {
			if (portfolioItem.media && portfolioItem.media.mediaUrl) {
				// Delete the old physical file
				await unlink(join(process.cwd(), portfolioItem.media.mediaUrl)).catch(
					(err) => console.error(`Failed to delete old file: ${err}`),
				);
				portfolioItem.media.mediaUrl = `/uploads/${file.filename}`;
			} else {
				const newMedia = new MediaEntity();
				newMedia.mediaUrl = `/uploads/${file.filename}`;
				newMedia.mediaType = MediaType.IMAGE;
				portfolioItem.media = newMedia;
			}
		}

		Object.assign(portfolioItem, updatePortfolioDto);
		return this.portfolioRepo.save(portfolioItem);
	}

	async remove(id: number) {
		const portfolioItem = await this.findOne(id);

		if (portfolioItem.media) {
			const mediaEntity = portfolioItem.media;

			if (mediaEntity.mediaUrl) {
				await unlink(join(process.cwd(), mediaEntity.mediaUrl)).catch((err) =>
					console.error(`Failed to delete physical file: ${err}`),
				);
			}

			await this.mediaRepo.remove(mediaEntity);
		}

		await this.portfolioRepo.remove(portfolioItem);

		return { message: `Portfolio item #${id} has been deleted successfully` };
	}
}
