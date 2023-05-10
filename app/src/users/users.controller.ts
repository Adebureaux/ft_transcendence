import { Controller, Get, Patch, Param, UseGuards, Req, Query, HttpCode, Body, Res, UseFilters } from "@nestjs/common";
import JwtAuthGuard from "../auth/guard/jwt-auth.guard";
import { UsersService } from "./users.service";
import { ParamUsernameDto, QueryGetGamesDto, QuerySearchUserDto, QueryToggle2FADto, updateUsernameDto } from "../utils/dto/users.dto";
import { IGames, UserProfile, UserWhole, UserWholeOutput } from "../utils/types/users.types";
import { IRequestWithUser } from "../auth/auths.interface";
import { AuthService } from "src/auth/auth.service";
import { Response } from "express";
import { toUserWholeOutput } from "src/utils/helpers/output";
import { PrismaService } from "src/prisma.service";
import { TooLargeFilter } from "src/utils/filters/redirection.filter";

@UseGuards(JwtAuthGuard)
@UseFilters(TooLargeFilter)
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService, private readonly authService: AuthService, private readonly prismaService: PrismaService) {}

    @Get("me")
    async getMe(@Req() request: IRequestWithUser): Promise<UserWholeOutput> {
        const user: UserWhole = await this.usersService.getWholeUser(request.user.username);
        return toUserWholeOutput(user);
    }

    @Get(":username/profile")
    async getProfile(@Param() usernameDto: ParamUsernameDto, @Req() request: IRequestWithUser): Promise<UserProfile> {
        if ((usernameDto.username as string) == "me") return await this.usersService.getProfile(request.user.username);
        return await this.usersService.getProfile(usernameDto.username);
    }

    @Get("me/games")
    async getGames(@Req() request: IRequestWithUser, @Query() query: QueryGetGamesDto): Promise<IGames> {
        return await this.usersService.getUserGames(request.user.username, query.skip, query.take, query.order);
    }

    @Get(":username/games")
    async getTargetGames(@Param() usernameDto: ParamUsernameDto, @Query() query: QueryGetGamesDto): Promise<IGames> {
        return await this.usersService.getUserGames(usernameDto.username, query.skip, query.take, query.order);
    }

    @Get("search")
    async searchUsers(@Req() request: IRequestWithUser, @Query() query: QuerySearchUserDto) {
        return await this.usersService.findUsers(request.user.username, query.key, query.skip, query.take);
    }
    @Patch(":username/follow")
    @HttpCode(205)
    async followUser(@Param() usernameDto: ParamUsernameDto, @Req() request: IRequestWithUser) {
        const user = await this.usersService.getWholeUser(request.user.username);
        return await this.usersService.followUser(user, usernameDto.username);
    }

    @Patch(":username/unfollow")
    @HttpCode(205)
    async unfollowUser(@Param() usernameDto: ParamUsernameDto, @Req() request: IRequestWithUser) {
        const user = await this.usersService.getWholeUser(request.user.username);
        return await this.usersService.unfollowUser(user, usernameDto.username);
    }

    @Patch(":username/block")
    @HttpCode(205)
    async blockUser(@Param() usernameDto: ParamUsernameDto, @Req() request: IRequestWithUser) {
        if (request.user.blocking.find((e) => e.blockingId === usernameDto.username)) {
            return await this.usersService.unblockUser(request.user, usernameDto.username);
        }
        return await this.usersService.blockUser(request.user, usernameDto.username);
    }

    @Patch("2FA")
    @HttpCode(205)
    async toggle2FA(@Query() query: QueryToggle2FADto, @Req() request: IRequestWithUser) {
        return await this.usersService.toggle2FA(request.user, query.toggle);
    }

    @Patch("username")
    async updateUsername(@Body() updateUsernameDto: updateUsernameDto, @Req() request: IRequestWithUser, @Res({ passthrough: true }) response: Response): Promise<UserWholeOutput> {
        await this.usersService.updateUsername(request.user.username, updateUsernameDto.username);
        const { accessTokenCookie, WsAuthTokenCookie, refreshTokenAndCookie } = await this.authService.generateNewTokens(request.user);
        response.setHeader("Set-Cookie", [accessTokenCookie.cookie, accessTokenCookie.has_access, refreshTokenAndCookie.cookie, refreshTokenAndCookie.has_refresh, WsAuthTokenCookie]);
        const user: UserWhole = await this.prismaService.getWholeUserByEmail(request.user.email);
        return toUserWholeOutput(user);
    }

    @Get("")
    async getAllUsernames(@Req() request: IRequestWithUser) {
        return await this.usersService.getAllUsernames(request.user.username);
    }

    @Get("allusers")
    async getAllUsers() {
        return await this.usersService.getAllUsers();
    }
}
