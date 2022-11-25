import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		forceCloseConnections: true,
	});
	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());
	app.enableShutdownHooks();
	await app.listen(3000, '0.0.0.0')
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap()
