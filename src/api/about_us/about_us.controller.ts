import {
	Controller,
	Post,
	Body,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	UseGuards,
	Get,
	Patch,
	Delete,
	Query,
	ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoles } from '../user/user.roles';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AboutUsService } from './about_us.service';
import { CreateAboutUsDto } from './dto/create-about_us.dto';
import { UpdateAboutUsDto } from './dto/update-about_us.dto';

@Controller('aboutUs')
export class AboutUsController {
	constructor(private readonly aboutUsService: AboutUsService) {}

	@Post('newAboutUs')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) =>
					cb(null, `${uuid()}${extname(file.originalname)}`),
			}),
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			required: ['media', 'content'],
			properties: {
				media: { type: 'string', format: 'binary' },
				content: { type: 'string' },
			},
		},
	})
	create(
		@Body(new ValidationPipe()) createDto: CreateAboutUsDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) throw new BadRequestException('An media file is required.');
		return this.aboutUsService.create(createDto, file);
	}

	@Get('getAboutUs')
	getAboutUs() {
		return this.aboutUsService.find();
	}

	@Patch('updateAboutUs')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) =>
					cb(null, `${uuid()}${extname(file.originalname)}`),
			}),
		}),
	)
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				media: { type: 'string', format: 'binary', nullable: true },
				content: { type: 'string', nullable: true },
			},
		},
	})
	update(
		@Body() updateDto: UpdateAboutUsDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		return this.aboutUsService.update(updateDto, file);
	}

	@Delete('deleteAboutUs')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	remove(@Query('id') id: string) {
		return this.aboutUsService.remove(+id);
	}
}
