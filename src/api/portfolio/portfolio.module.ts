import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioEntity } from './entities/portfolio.entity';
import { UserModule } from '../user/user.module';
import { MediaEntity } from '../../utils/media.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([PortfolioEntity, MediaEntity]),
		UserModule,
	],
	controllers: [PortfolioController],
	providers: [PortfolioService],
})
export class PortfolioModule {}
