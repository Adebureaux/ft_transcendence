import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService} from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, AuthService, JwtService],
  exports: [UsersService],

})
export class UsersModule {}
