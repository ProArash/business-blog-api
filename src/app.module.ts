import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { PostModule } from './api/post/post.module';
import { UserModule } from './api/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				url: configService.get<string>('DB_URL'),
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		AuthModule,
		PostModule,
		UserModule,
	],
})
export class AppModule {}
