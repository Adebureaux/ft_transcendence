import { CacheModule, Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma.service";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategy/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy/jwt.strategy";
import { JwtRefreshStrategy } from "./strategy/jwt-refresh.strategy";
import * as dotenv from "dotenv";
import { AvatarService } from "src/avatar/avatar.service";
import { AvatarModule } from "src/avatar/avatar.module";
import { HttpModule } from "@nestjs/axios";

dotenv.config();
@Global()
@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: `${process.env.JWT_ACCESS_SECRET}`,
            signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME },
        }),
        HttpModule,
        CacheModule.register(),
        AvatarModule,
    ],
    controllers: [AuthController],
    providers: [PassportModule, AuthService, PrismaService, LocalStrategy, JwtRefreshStrategy, JwtStrategy, AvatarService],
    exports: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
