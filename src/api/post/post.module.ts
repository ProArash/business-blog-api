import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { UserModule } from '../user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([PostEntity]), UserModule],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
