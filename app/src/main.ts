import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { WsSocketAdapter } from "./ws/ws.adapter";
import { json, urlencoded } from "express";

async function bootstrap() {
    const app = await NestFactory.create(AppModule.register(), {
        forceCloseConnections: true,
    });
    app.useWebSocketAdapter(new WsSocketAdapter(app));
    app.use(cookieParser());
    app.use(json({ limit: "1mb" }));
    app.use(urlencoded({ extended: true, limit: "1mb" }));
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, transformOptions: { enableImplicitConversion: true } }));
    app.enableShutdownHooks();
    await app.listen(process.env.NODE_ENV === "prod" ? 80 : 3000, "::");
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
