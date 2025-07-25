import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from '../../utils/media.entity';
import { UserModule } from '../user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([MediaEntity]), UserModule],
	controllers: [MediaController],
	providers: [MediaService],
})
export class MediaModule {}
