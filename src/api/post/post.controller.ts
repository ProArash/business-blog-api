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
	BadRequestException,
	Patch,
	Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserPayload } from '../auth/user.payload';
import { PostStatus } from './entities/post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { RolesGuard } from '../auth/roles.guard';
import { UserRoles } from '../user/user.roles';
import { Roles } from '../auth/roles.decorator';

@Controller('post')
export class PostController {
	constructor(private readonly postService: PostService) {}

	@Post('newPost')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN, UserRoles.AUTHOR)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, callback) => {
					const suffix = uuid();
					const extension = extname(file.originalname);
					const fileName = `${suffix}${extension}`;
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
			required: ['media', 'title', 'slug', 'content', 'status', 'tags'],
			properties: {
				media: { type: 'string', format: 'binary' },
				title: { type: 'string', example: 'My Awesome Post' },
				slug: { type: 'string', example: 'my-awesome-post' },
				content: { type: 'string', example: 'This is the full content...' },
				status: { type: 'string', enum: Object.values(PostStatus) },
				tags: {
					type: 'array',
					items: { type: 'string' },
					example: ['tech', 'nestjs'],
				},
			},
		},
	})
	async create(
		@Body() createPostDto: CreatePostDto,
		@Req() req: Request,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException('Media file is required.');
		}
		const { email } = req.user as UserPayload;
		return await this.postService.create(createPostDto, email, file);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.postService.findAll(+pageNumber);
	}

	@Get('getById')
	getById(@Query('id') id: string) {
		return this.postService.getPostById(+id);
	}

	@Get('getBySlug')
	getBySlug(@Query('slug') slug: string) {
		return this.postService.getPostBySlug(slug);
	}

	@UseGuards(AuthGuard('jwt'))
	@Roles(UserRoles.ADMIN)
	@Get('getAllAdmin')
	findAllAdmin(@Query('pageNumber') pageNumber: string) {
		return this.postService.findAllAdmin(+pageNumber);
	}

	@UseGuards(AuthGuard('jwt'))
	@Roles(UserRoles.ADMIN)
	@Get('getByIdAdmin')
	getByIdAdmin(@Query('id') id: string) {
		return this.postService.getPostByIdAdmin(+id);
	}

	@Patch('updateById')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN, UserRoles.AUTHOR)
	@UseInterceptors(
		FileInterceptor('media', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, callback) => {
					const fileName = `${uuid()}${extname(file.originalname)}`;
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
				media: { type: 'string', format: 'binary', nullable: true },
				title: { type: 'string' },
				slug: { type: 'string' },
				content: { type: 'string' },
				status: { type: 'string', enum: Object.values(PostStatus) },
				tags: { type: 'array', items: { type: 'string' } },
			},
		},
	})
	async update(
		@Query('id') id: string,
		@Body() updatePostDto: UpdatePostDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		return await this.postService.update(+id, updatePostDto, file);
	}

	@Delete('deleteById')
	@UseGuards(AuthGuard('jwt'), RolesGuard)
	@Roles(UserRoles.ADMIN, UserRoles.AUTHOR)
	async remove(@Query('id') id: string) {
		return await this.postService.remove(+id);
	}

	@Get('search')
	@ApiQuery({
		name: 'term',
		required: true,
		description: 'The search term for posts.',
	})
	search(@Query('term') term: string) {
		if (!term || term.trim() === '') {
			throw new BadRequestException('Search term cannot be empty.');
		}
		return this.postService.search(term);
	}
}
