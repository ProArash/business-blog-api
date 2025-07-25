import {
	Controller,
	Get,
	Post,
	Body,
	Req,
	UseInterceptors,
	UploadedFile,
	UseGuards,
	Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Request } from 'express';
import { IUserPayload } from '../auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('post')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@UseGuards(AuthGuard('jwt'))
	@Post('uploadImage')
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, callback) => {
					const suffix = uuid();
					const extension = extname(file.originalname);
					const fileName = `${suffix}${extension}`;
					return callback(null, fileName);
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
				image: {
					type: 'string',
					format: 'binary',
				},
				tag: {
					type: 'string',
				},
				title: {
					type: 'string',
				},
				description: {
					type: 'string',
				},
			},
		},
	})
	async create(
		@Body() createPostDto: CreatePostDto,
		@Req() req: Request,
		@UploadedFile() file: Express.Multer.File,
	) {
		const { email: username } = req.user as IUserPayload;
		createPostDto.imageUrl = file.filename;

		return await this.postService.create(createPostDto, username);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.postService.findAll(+pageNumber);
	}
}
