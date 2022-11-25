import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { UserProfile} from './types/users.types';

import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(':username')
	async getUser(@Param('username') username: string): Promise<User> {
		return await this.usersService.getUser(username);
	}
	@Post('')
	async newUser(@Body() userDto: CreateUserDto): Promise<User> {
		return await this.usersService.createUser(userDto);
	}
	@Get(':username/profile')
	async getProfile(@Param('username') username: string): Promise<UserProfile> {
		return await this.usersService.getProfile(username);
	}
}
