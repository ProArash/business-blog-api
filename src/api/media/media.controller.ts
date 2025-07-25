import {
	Controller,
	Post,
	Get,
	Delete,
	Query,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoles } from '../user/user.roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { UserEntity } from '../user/entities/user.entity';

@Controller('media')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRoles.ADMIN)
export class MediaController {
	constructor(private readonly mediaService: MediaService) {}

	@Post('upload')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, callback) => {
					const fileName = `${uuid()}${extname(file.originalname)}`;
					callback(null, fileName);
				},
			}),
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['file'],
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description: 'Any media file (image, video, audio).',
				},
			},
		},
	})
	uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
		if (!file) {
			throw new BadRequestException('A file must be provided.');
		}
		return this.mediaService.uploadFile(file, req.user as UserEntity);
	}

	@Get('getAll')
	findAll(@Query('page') page: string) {
		return this.mediaService.findAll(+page || 1);
	}

	@Get('getById')
	findOne(@Query('id') id: string) {
		return this.mediaService.findOneById(+id);
	}

	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.mediaService.remove(+id);
	}
}
