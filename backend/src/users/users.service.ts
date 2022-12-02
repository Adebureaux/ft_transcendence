import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User, Game } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto, QuerySearchUserDto } from './dto/users.dto';
import { UserProfile, userProfileQuery, userWholeQuery, UserWhole } from './types/users.types';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
	constructor(private prismaService:PrismaService) {}

	async createUser(userDto: CreateUserDto) : Promise<User> {
		try {
			const user = await this.prismaService.user.create({data: userDto})
			return user;
		}
		catch(error) {
			throw new BadRequestException("User already exists");
		}
	}

	async getUser(name : string) : Promise<User> {
		try {
			const user = await this.prismaService.user.findUnique({ where: { username: name } });
			// if (user)
				return user;
		}
		catch(error) {
            throw new NotFoundException("User not found");}
		// throw new NotFoundException("user not found")
	}

	async getProfile(name : string) : Promise<UserProfile> {
		const user = await this.prismaService.user.findUnique(
			{
				where: { username: name },
				...userProfileQuery
			});
		return user;
	}

	async getWholeUser(name : string) : Promise<UserWhole> {
		const user = await this.prismaService.user.findUnique(
			{
				where: { username: name },
				...userWholeQuery
			});
		return user;
	}

	async getUserGames(name : string, skipValue: number, takeValue: number, orderParam:string) : Promise<any> {
		// https://github.com/prisma/prisma/issues/7550

		if (!(orderParam === 'asc' || orderParam === 'desc'))
		    throw new BadRequestException("Invalid Query parameter(s):\n'take' should be >= 1 and <= 40\n'skip' parameter should be >= 0\n'orderParam' should be 'asc' or 'desc");
		const queryObject = {where: { OR: [{playerOneName : name}, {playerTwoName : name}] }};
		const games = await this.prismaService.game.findMany({...queryObject, skip: skipValue, take: takeValue, orderBy: { finishedAt: orderParam }});
		const maxResults = await this.prismaService.game.count(queryObject);
	
		return { total: maxResults, result:	games};
	}

	async findUsers(name : string, key : string, skipValue: number, takeValue: number) {
		// https://github.com/prisma/prisma/issues/7550
		if (takeValue > 40 || takeValue < 1 || skipValue < 0 || !key)
		    throw new BadRequestException("Invalid Query parameter(s):\n'take' should be >= 1 and <= 40\n'skip' parameter should be >= 0\nsearch 'key' parameter should not be 'falsy'");
		const queryObject = {where: {NOT: [{username:name}], username: { contains: key}}};
		const users = await this.prismaService.user.findMany({...queryObject, skip: skipValue, take: takeValue});
		const maxResults = await this.prismaService.user.count(queryObject);
		
		return { total: maxResults, result:	users};
	}





	async setRefreshToken(refreshToken: string, name: string) {
		const HashedRefreshToken = await bcrypt.hash(refreshToken, 10);
		await this.prismaService.user.update({
  			where: { username: name },
 			data: { refresh_token: HashedRefreshToken },
		});
	}

	async setNewPassword(newpassword: string, name: string) {
		const Hashednewpassword = await bcrypt.hash(newpassword, 10);
		await this.prismaService.user.update({
  			where: { username: name },
 			data: { password: Hashednewpassword },
		});
	}

	async getUserIfRefreshTokenMatches(refreshToken: string, name: string) {
    	const user = await this.getUser(name);
    	const res = await bcrypt.compare(refreshToken, user.refresh_token);
		if (res) {
			return user;
		}
	}
	async deleteRefreshToken(name : string) {
		await this.prismaService.user.update(
						{
				where: { username: name },
				data: { refresh_token: null }
			});
	}

}
