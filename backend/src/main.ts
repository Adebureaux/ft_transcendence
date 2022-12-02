import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser';
// import Joi from 'joi';


async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		forceCloseConnections: true,
	});
	app.use(cookieParser());
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, transformOptions: { enableImplicitConversion: true }}));
	app.enableShutdownHooks();
	await app.listen(3000, '0.0.0.0')
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap()
