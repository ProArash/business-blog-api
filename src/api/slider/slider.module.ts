import { Module } from '@nestjs/common';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SliderEntity } from './entities/slider.entity';
import { UserModule } from '../user/user.module';
import { MediaEntity } from '../../utils/media.entity';

@Module({
	imports: [TypeOrmModule.forFeature([SliderEntity, MediaEntity]), UserModule],
	controllers: [SliderController],
	providers: [SliderService],
})
export class SliderModule {}
