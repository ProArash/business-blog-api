import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BasicInterceptor } from './basic.interceptor';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: ['http://localhost:3000', 'https://bastan.arash.vip'],
		credentials: true,
	});
	app.use(cookieParser());
	app.useGlobalInterceptors(new BasicInterceptor());
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (error: ValidationError[]) => {
				const errorObj: Record<string, string> = {};
				const errorStrings: string[] = [];
				error.forEach((err) => {
					if (err.constraints) {
						errorObj[err.property] = Object.values(err.constraints).join(', ');
						errorStrings.push(Object.values(err.constraints).toString());
					}
				});
				return new HttpException(
					{
						message: 'Please check your inputs.',
						status: HttpStatus.BAD_REQUEST,
						properties: errorObj,
						errors: errorStrings,
					},
					HttpStatus.BAD_REQUEST,
				);
			},
		}),
	);
	const swaggerConfig = new DocumentBuilder()
		.setTitle('Bastan Group API docs')
		.build();
	const swaggerDocument = () =>
		SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('/', app, swaggerDocument);

	await app.listen(PORT);
}
bootstrap()
	.then(() => {
		console.log(`server is running on port ${PORT}`);
	})
	.catch((err) => {
		console.log(err);
	});
