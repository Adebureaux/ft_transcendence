import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { IRequestWithUser } from 'src/auth/auths.interface';
import JwtAuthGuard from 'src/auth/guard/jwt-auth.guard';
import { AvatarService } from './avatar.service';

@UseGuards(JwtAuthGuard)
@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

	@Post()
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: process.cwd() + 'avatars'
		})
	}))
	uploadAvatar(@Req() request: IRequestWithUser, @UploadedFile() file: Express.Multer.File) {

	}

}
