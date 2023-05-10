import { DynamicModule, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { UsersModule } from "./users/users.module";
import { AvatarModule } from "./avatar/avatar.module";
import { WsModule } from "./ws/ws.module";
import { AuthModule } from "./auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";
import * as dotenv from "dotenv";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
dotenv.config();

@Module({})
export class AppModule {
    static register(): DynamicModule {
        const imports = [ScheduleModule.forRoot(), AuthModule, WsModule, UsersModule, AvatarModule];
        const providers = [PrismaService];
        const exports = [PrismaService, AuthModule, WsModule];
        if (process.env.NODE_ENV === "prod") {
            imports.push(
                ServeStaticModule.forRoot({
                    rootPath: join(__dirname, "../..", "client", "dist"),
                    exclude: ["/api*"],
                })
            );
        }
        return {
            module: AppModule,
            imports,
            providers,
            exports,
        };
    }
}
