import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Delete,
	Query,
	ValidationPipe,
	UseInterceptors,
	UseGuards,
	UploadedFile,
	BadRequestException,
	Req,
	Param,
} from '@nestjs/common';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { FileInterceptor } from '@nestjs/platform-express'; // Changed from FilesInterceptor
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoles } from '../user/user.roles';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { UserPayload } from '../auth/user.payload';

@ApiTags('slider')
@Controller('slider')
export class SliderController {
	constructor(private readonly sliderService: SliderService) {}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
			fileFilter(req, file, callback) {
				if (
					!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|mp3)$/)
				) {
					return callback(
						new BadRequestException('Only media files are allowed!'),
						false,
					);
				}
				callback(null, true);
			},
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['media', 'title', 'subtitle', 'link', 'order', 'status'],
			properties: {
				media: {
					type: 'string',
					format: 'binary',
					description: 'A media file for the slider.',
				},
				title: { type: 'string', example: 'Summer Sale' },
				subtitle: { type: 'string', example: 'Up to 50% off!' },
				link: { type: 'string', example: '/products/summer-collection' },
				order: { type: 'number', example: 1 },
				status: { type: 'boolean', example: true },
			},
		},
	})
	@Post('newSlider')
	create(
		@Body(
			new ValidationPipe({
				transform: true,
				transformOptions: { enableImplicitConversion: true },
			}),
		)
		createSliderDto: CreateSliderDto,
		@UploadedFile() file: Express.Multer.File,
		@Req() req: Request,
	) {
		if (!file) {
			throw new BadRequestException('Media file cannot be empty');
		}
		const { email } = req.user as UserPayload;

		return this.sliderService.create(createSliderDto, file, email);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.sliderService.findAll(+pageNumber || 1);
	}

	@Get('getById/:id')
	findOne(@Param('id') id: string) {
		return this.sliderService.findOne(+id);
	}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
			fileFilter(req, file, callback) {
				if (
					!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp|mp4|mp3)$/)
				) {
					return callback(
						new BadRequestException('Only media files are allowed!'),
						false,
					);
				}
				callback(null, true);
			},
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				media: {
					type: 'string',
					format: 'binary',
					description:
						'New media for the slider. If provided, it will replace the old one.',
					nullable: true,
				},
				title: { type: 'string', nullable: true },
				subtitle: { type: 'string', nullable: true },
				link: { type: 'string', nullable: true },
				order: { type: 'number', nullable: true },
				status: { type: 'boolean', nullable: true },
			},
		},
	})
	@Patch('updateById/:id')
	update(
		@Param('id') id: string,
		@Body(
			new ValidationPipe({
				transform: true,
				transformOptions: { enableImplicitConversion: true },
			}),
		)
		updateSliderDto: UpdateSliderDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		return this.sliderService.update(updateSliderDto, +id, file);
	}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@Delete('deleteById/:id')
	remove(@Param('id') id: string) {
		return this.sliderService.remove(+id);
	}
}
