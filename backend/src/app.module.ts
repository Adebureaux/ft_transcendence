import { Module } from '@nestjs/common'
// import { AppController } from './app.controller'
import { PrismaService } from './prisma.service'
import { UsersService } from './users/users.service'
import { AuthService } from './auth/auth.service'
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [ChannelsModule, UsersModule, AuthModule, ChannelsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..' , 'client'),
      exclude: ['/api*'],
    }),],
  controllers: [],
  providers: [PrismaService, UsersService, AuthService],
  exports: [PrismaService, UsersService, AuthService],

})
export class AppModule {}
