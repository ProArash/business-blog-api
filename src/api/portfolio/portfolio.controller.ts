import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Delete,
	UseGuards,
	UseInterceptors,
	UploadedFile,
	BadRequestException,
	Query,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from '../user/user.roles';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import { RolesGuard } from '../auth/roles.guard';
import { extname } from 'path';

@Controller('portfolio')
export class PortfolioController {
	constructor(private readonly portfolioService: PortfolioService) {}

	@Post('newPortfolio')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) =>
					cb(null, `${uuid()}${extname(file.originalname)}`),
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
			required: ['media', 'title', 'description', 'url'],
			properties: {
				media: {
					type: 'string',
					format: 'binary',
					description: 'The main media for the portfolio item.',
				},
				title: {
					type: 'string',
					example: 'E-commerce Website',
				},
				description: {
					type: 'string',
					example: 'A full-stack web application built with NestJS and React.',
				},
				url: {
					type: 'string',
					example: 'https://my-portfolio-project.com',
				},
			},
		},
	})
	create(
		@Body() createPortfolioDto: CreatePortfolioDto,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) throw new BadRequestException('Media file is required.');
		return this.portfolioService.create(createPortfolioDto, file);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.portfolioService.findAll(+pageNumber);
	}

	@Get('getById')
	findOne(@Query('id') id: string) {
		return this.portfolioService.findOne(+id);
	}

	@Patch('updateById')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) =>
					cb(null, `${uuid()}${extname(file.originalname)}`),
			}),
			fileFilter(req, file, callback) {
				if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|mp3)$/)) {
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
					description: 'A new media to replace the existing one.',
					nullable: true,
				},
				title: {
					type: 'string',
					nullable: true,
				},
				description: {
					type: 'string',
					nullable: true,
				},
				url: {
					type: 'string',
					nullable: true,
				},
			},
		},
	})
	update(
		@Query('id') id: string,
		@Body() updatePortfolioDto: UpdatePortfolioDto,
		@UploadedFile() file?: Express.Multer.File, // File is optional on update
	) {
		return this.portfolioService.update(+id, updatePortfolioDto, file);
	}

	@Delete('deleteById')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN)
	remove(@Query('id') id: string) {
		return this.portfolioService.remove(+id);
	}
}
