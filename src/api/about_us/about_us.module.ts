import { Module } from '@nestjs/common';
import { AboutUsService } from './about_us.service';
import { AboutUsController } from './about_us.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutUsEntity } from './entities/about_us.entity';
import { UserModule } from '../user/user.module';
import { MediaEntity } from '../../utils/media.entity';

@Module({
	imports: [TypeOrmModule.forFeature([AboutUsEntity, MediaEntity]), UserModule],
	controllers: [AboutUsController],
	providers: [AboutUsService],
})
export class AboutUsModule {}
