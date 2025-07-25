import { Module } from '@nestjs/common';
import { AboutUsService } from './about_us.service';
import { AboutUsController } from './about_us.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutUsEntity } from './entities/about_us.entity';
import { UserModule } from '../user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([AboutUsEntity]), UserModule],
	controllers: [AboutUsController],
	providers: [AboutUsService],
})
export class AboutUsModule {}
