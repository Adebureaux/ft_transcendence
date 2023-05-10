import { CacheModule, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PrismaService } from "src/prisma.service";

@Module({
    imports: [CacheModule.register()],
    controllers: [UsersController],
    providers: [PrismaService, UsersService],
    exports: [],
})
export class UsersModule {}
