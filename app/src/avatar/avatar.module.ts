import { Module } from "@nestjs/common";
import { AvatarService } from "./avatar.service";
import { AvatarController } from "./avatar.controller";
import { PrismaService } from "src/prisma.service";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    controllers: [AvatarController],
    providers: [PrismaService, AvatarService],
    exports: [AvatarService],
})
export class AvatarModule {}
