import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AvatarService {
	constructor(private prismaService:PrismaService,
				private usersService:UsersService) {}
	
}
