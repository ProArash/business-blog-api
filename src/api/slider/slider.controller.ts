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
		FilesInterceptor('images', 10, {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				images: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
				title: {
					type: 'string',
				},
				subtitle: {
					type: 'string',
				},
				link: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				order: {
					type: 'number',
				},
				status: {
					type: 'boolean',
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
		if (!files) throw new BadRequestException('images can not be empty');
		const images = files.map((v) => `/uploads/${v.filename}`);
		const { email } = req.user as UserPayload;
		return this.sliderService.create(createSliderDto, images, email);
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
		FilesInterceptor('images', 10, {
			storage: diskStorage({
				destination: './uploads',
				filename(req, file, callback) {
					const extension = extname(file.originalname);
					const fileName = `${uuid()}${extension}`;
					callback(null, fileName);
				},
			}),
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: 'multipart/form-data',
		schema: {
			type: 'object',
			properties: {
				images: {
					type: 'string[]',
					format: 'binary',
				},
				title: {
					type: 'string',
				},
				subtitle: {
					type: 'string',
				},
				link: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
				order: {
					type: 'number',
				},
				status: {
					type: 'boolean',
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
		const images = files.map((v) => `/uploads/${v.filename}`);
		return this.sliderService.update(updateSliderDto, +id, images);
	}

	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.sliderService.remove(+id);
	}
}
