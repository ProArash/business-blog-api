import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { PostModule } from './api/post/post.module';
import { UserModule } from './api/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortfolioModule } from './api/portfolio/portfolio.module';
import { ContactUsModule } from './api/contact_us/contact_us.module';
import { CommentModule } from './api/comment/comment.module';
import { AboutUsModule } from './api/about_us/about_us.module';
import { SliderModule } from './api/slider/slider.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MediaEntity } from './utils/media.entity';
import { MediaModule } from './api/media/media.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'uploads'),
			serveRoot: '/uploads/',
		}),
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'mysql',
				url: configService.get<string>('DB_URL'),
				autoLoadEntities: true,
				entities: [MediaEntity],
				synchronize: true,
			}),
		}),
		AuthModule,
		PostModule,
		UserModule,
		PortfolioModule,
		ContactUsModule,
		CommentModule,
		AboutUsModule,
		SliderModule,
		MediaModule,
	],
})
export class AppModule {}
