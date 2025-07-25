import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { MediaEntity, MediaType } from '../../utils/media.entity';
import { UserEntity } from '../user/entities/user.entity';
import { MediaResponseDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
	constructor(
		@InjectRepository(MediaEntity)
		private mediaRepo: Repository<MediaEntity>,
	) {}

	private getMediaType(mimeType: string): MediaType {
		if (mimeType.startsWith('image/')) return MediaType.IMAGE;
		if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
		if (mimeType.startsWith('video/')) return MediaType.VIDEO;
		return MediaType.UNKNOWN;
	}

	async uploadFile(
		file: Express.Multer.File,
		user: UserEntity,
	): Promise<MediaResponseDto> {
		if (!file) {
			throw new Error('File is required for upload.');
		}

		const media = this.mediaRepo.create({
			mediaUrl: `/uploads/${file.filename}`,
			mediaType: this.getMediaType(file.mimetype),
			user: user,
		});

		const savedMedia = await this.mediaRepo.save(media);

		return {
			id: savedMedia.id,
			mediaType: savedMedia.mediaType,
			mediaUrl: savedMedia.mediaUrl,
			userId: savedMedia.user.id,
			createdAt: savedMedia.createdAt,
		};
	}

	async findAll(pageNumber: number = 1): Promise<MediaEntity[]> {
		const limit = 10;
		const skip = (pageNumber - 1) * limit;
		return this.mediaRepo.find({
			take: limit,
			skip,
			relations: ['user'],
			order: { createdAt: 'DESC' },
		});
	}

	async findOneById(id: number): Promise<MediaEntity> {
		const media = await this.mediaRepo.findOne({
			where: { id },
			relations: ['user'],
		});
		if (!media) {
			throw new NotFoundException(`Media with ID #${id} not found.`);
		}
		return media;
	}

	async remove(id: number): Promise<{ message: string }> {
		const media = await this.findOneById(id);

		await unlink(join(process.cwd(), media.mediaUrl)).catch((err) =>
			console.error(`Failed to delete physical file: ${err}`),
		);

		const result = await this.mediaRepo.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(
				`Media with ID #${id} not found for deletion.`,
			);
		}

		return { message: `Media #${id} has been deleted successfully.` };
	}
}
