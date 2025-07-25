import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentEntity } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '../post/post.module';

@Module({
	imports: [TypeOrmModule.forFeature([CommentEntity]), PostModule],
	controllers: [CommentController],
	providers: [CommentService],
})
export class CommentModule {}
