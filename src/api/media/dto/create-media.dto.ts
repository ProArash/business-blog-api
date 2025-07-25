import { MediaType } from '../../../utils/media.entity';

export class CreateMediaDto {}

export class MediaResponseDto {
	id: number;
	mediaType: MediaType;
	mediaUrl: string;
	userId: number;
	createdAt: Date;
}
