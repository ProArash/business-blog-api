import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './jwt.guard';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			global: true,
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('SECRET') ?? 'secret',
				signOptions: {
					expiresIn: '7d',
				},
			}),
		}),
		UserModule,
		PassportModule,
	],
	controllers: [AuthController],
	providers: [AuthService, ConfigService, JwtAuthGuard],
})
export class AuthModule {}
