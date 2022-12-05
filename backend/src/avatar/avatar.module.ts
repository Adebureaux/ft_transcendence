import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [],
  	controllers: [AvatarController],
 	providers: [AvatarService, PrismaService, UsersService, AuthService, JwtService]
})
export class AvatarModule {}
