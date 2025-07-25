import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@Post('newComment')
	create(@Body() createCommentDto: CreateCommentDto) {
		return this.commentService.create(createCommentDto);
	}

	@Get('getAll')
	findAll(@Query('pageNumber') pageNumber: string) {
		return this.commentService.findAll(+pageNumber);
	}

	@Delete('deleteById')
	remove(@Query('id') id: string) {
		return this.commentService.remove(+id);
	}
}
