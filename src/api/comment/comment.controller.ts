import {
	Controller,
	Get,
	Post,
	Body,
	Delete,
	Query,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRoles } from '../user/user.roles';

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Post('newComment')
	create(@Body() createCommentDto: CreateCommentDto) {
		return this.commentService.create(createCommentDto);
	}

	@Get('getAll')
	findAll(
		@Query('postId') postId: string,
		@Query('pageNumber') pageNumber: string,
	) {
		return this.commentService.findAll(+postId, +pageNumber);
	}

	@UseGuards(AuthGuard('jwt'))
	@Roles(UserRoles.ADMIN)
	@Get('getAllForAdmin')
	findAllAdmin(@Query('pageNumber') pageNumber: string) {
		return this.commentService.findAllAdmin(+pageNumber);
	}

	@Patch('updateById')
	update(@Query('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
		return this.commentService.update(+id, updateCommentDto);
	}

	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.commentService.remove(+id);
	}
}
