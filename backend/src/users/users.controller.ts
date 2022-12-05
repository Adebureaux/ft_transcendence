import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import JwtAuthGuard from '../auth/guard/jwt-auth.guard';
import { UsersService } from './users.service';
import { ParamUsernameDto, QueryGetGamesDto, QuerySearchUserDto } from './dto/users.dto';
import { IGames, UserProfile, UserWhole} from './types/users.types';
import { IRequestWithUser } from '../auth/auths.interface';


@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	async getMe(@Req() request: IRequestWithUser): Promise<UserWhole> {
		return await this.usersService.getWholeUser(request.user.username);
	}

	@Get(':username/profile')
	async getProfile(@Param() usernameDto: ParamUsernameDto): Promise<UserProfile> {
		return await this.usersService.getProfile(usernameDto.username);
	}

	@Get('me/games')
	async getGames(@Req() request: IRequestWithUser,
		@Query() query: QueryGetGamesDto) : Promise<IGames> {
		return await this.usersService.getUserGames(request.user.username, query.skip, query.take, query.order);
	}

	@Get(':username/games')
	async getTargetGames(@Param() usernameDto: ParamUsernameDto,
		@Query() query: QueryGetGamesDto) : Promise<IGames> {
		return await this.usersService.getUserGames(usernameDto.username, query.skip, query.take, query.order);
	}

	@Get('search')
	async searchUsers(@Req() request: IRequestWithUser,
		@Query() query: QuerySearchUserDto) {
		return await this.usersService.findUsers(request.user.username, query.key, query.skip, query.take);
	}
}