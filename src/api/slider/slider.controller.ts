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
	UploadedFiles,
	BadRequestException,
	Req,
} from '@nestjs/common';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoles } from '../user/user.roles';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { UserPayload } from '../auth/user.payload';

@Controller('slider')
export class SliderController {
	constructor(private readonly sliderService: SliderService) {}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FilesInterceptor('medias', 10, {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
			fileFilter(req, file, callback) {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mp3)$/)) {
					return callback(
						new BadRequestException('Only medias files are allowed!'),
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
			required: ['medias', 'title', 'subtitle', 'link', 'order', 'status'],
			properties: {
				medias: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description: 'An array of medias for the slider.',
				},
				title: {
					type: 'string',
					example: 'Summer Sale',
				},
				subtitle: {
					type: 'string',
					example: 'Up to 50% off!',
				},
				link: {
					type: 'string',
					example: '/products/summer-collection',
				},
				order: {
					type: 'number',
					example: 1,
				},
				status: {
					type: 'boolean',
					example: true,
				},
			},
		},
	})
	@Post('newSlider')
	create(
		@Body(new ValidationPipe()) createSliderDto: CreateSliderDto,
		@UploadedFiles() files: Array<Express.Multer.File>,
		@Req() req: Request,
	) {
		if (!files || files.length === 0) {
			throw new BadRequestException('Medias cannot be empty');
		}
		const { email } = req.user as UserPayload;
		return this.sliderService.create(createSliderDto, files, email);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.sliderService.findAll(+pageNumber);
	}

	@Get('getById')
	findOne(@Query('id') id: string) {
		return this.sliderService.findOne(+id);
	}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FilesInterceptor('medias', 10, {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
			fileFilter(req, file, callback) {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mp3)$/)) {
					return callback(
						new BadRequestException('Only medias files are allowed!'),
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
				medias: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
					description:
						'New medias for the slider. If provided, they will replace the old ones.',
					nullable: true,
				},
				title: {
					type: 'string',
					nullable: true,
				},
				subtitle: {
					type: 'string',
					nullable: true,
				},
				link: {
					type: 'string',
					nullable: true,
				},
				order: {
					type: 'number',
					nullable: true,
				},
				status: {
					type: 'boolean',
					nullable: true,
				},
			},
		},
	})
	@Patch('updateById')
	update(
		@Query('id') id: string,
		@Body(new ValidationPipe()) updateSliderDto: UpdateSliderDto,
		@UploadedFiles() files: Express.Multer.File[],
	) {
		return this.sliderService.update(updateSliderDto, +id, files);
	}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.sliderService.remove(+id);
	}
}
