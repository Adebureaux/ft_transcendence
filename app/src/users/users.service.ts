import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { CreateUserDto } from "../utils/dto/users.dto";
import { UserProfile, UserWhole, IGames } from "../utils/types/users.types";
import * as bcrypt from "bcrypt";
import { WsService } from "src/ws/ws.service";

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService, private readonly wsService: WsService) {}

    async createUser(userDto: CreateUserDto): Promise<User> {
        try {
            const user = await this.prismaService.createUser(userDto);
            return user;
        } catch (error) {
            throw new BadRequestException("User already exists");
        }
    }

    async getUser(name: string): Promise<User> {
        try {
            const user = await this.prismaService.getUser(name);
            return user;
        } catch (error) {
            throw new NotFoundException("User not found");
        }
    }

    async getProfile(name: string): Promise<UserProfile> {
        return this.prismaService.getProfile(name);
    }

    async getWholeUser(name: string): Promise<UserWhole> {
        const infos: UserWhole = await this.prismaService.getWholeUser(name);
        return infos;
    }

    async getUserGames(name: string, skipValue: number, takeValue: number, orderParam: any): Promise<IGames> {
        return await this.prismaService.getUserGames(name, skipValue, takeValue, orderParam);
    }

    async findUsers(name: string, key: string, skipValue: number, takeValue: number) {
        return await this.prismaService.findUsers(name, key, skipValue, takeValue);
    }

    async followUser(stalker: UserWhole, target: string, notify: boolean = true) {
        if (stalker.username === target) throw new BadRequestException("Unable to follow yourself");
        // check if already follow
        if (stalker.following.some((e) => e.followingId === target)) return;

        try {
            const targetUserEntry = await this.prismaService.getWholeUser(target);
            if (targetUserEntry.blocking.some((e) => e.blockingId === stalker.username)) throw new ForbiddenException("Unable to follow a person who blocked you");
            if (stalker.blocking.some((e) => e.blockingId === target)) throw new ForbiddenException("Unable to follow a person you blocked");
            await this.prismaService.followUser(stalker, target);
            if (targetUserEntry.following.some((e) => e.followingId === stalker.username)) await this.prismaService.createOneToOneChannel(stalker.username, target);
            if (notify) this.wsService.notifyIfConnected([stalker.username, target], "fetch_me", null);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async unfollowUser(stalker: UserWhole, target: string, notify: boolean = true) {
        const kickusers = (channelId: string, username_list: string[]) => {
            username_list.forEach((username: string) => {
                this.wsService.userSockets.getUserSockets(username)?.forEach((target_socket) => {
                    if (target_socket?.data.current_channel === channelId) {
                        target_socket?.leave(channelId);
                        target_socket?.emit("kick", { channelId, reason: `This person unfollowed you.` });
                        target_socket.data.current_channel = null;
                    }
                });
            });
        };

        if (stalker.username === target) throw new BadRequestException("Unable to unfollow yourself");
        // check if stalker already follow target
        const channelId: string = await this.prismaService.getOneToOneChannel(stalker.username, target);
        let res = stalker.following.find((e) => e.followingId === target);
        if (res !== undefined) {
            try {
                await this.prismaService.unfollowUser(res.id);
                if (channelId) kickusers(channelId, [stalker.username, target]);
                if (notify) this.wsService.notifyIfConnected([stalker.username, target], "fetch_me", null);
            } catch (error) {
                throw new BadRequestException(error.message);
            }
        } else {
            // check if stalker is followed by target
            let res = stalker.followedBy.find((e) => e.followerId === target);
            if (res !== undefined) {
                try {
                    await this.prismaService.unfollowUser(res.id);
                    if (channelId) kickusers(channelId, [stalker.username, target]);
                    if (notify) this.wsService.notifyIfConnected([stalker.username, target], "fetch_me", null);
                } catch (error) {
                    throw new BadRequestException(error.message);
                }
            }
        }
    }

    async declineFollow(invity: UserWhole, inviter: string) {
        if (invity.username === inviter) throw new BadRequestException("Unable to decline your own invitation");
        if (!invity.followedBy.some((e) => e.followerId === inviter)) return;
        try {
            const targetObj = await this.getWholeUser(inviter);
            this.unfollowUser(targetObj, invity.username);
            this.wsService.notifyIfConnected([inviter, invity.username], "fetch_me", null);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    async blockUser(stalker: UserWhole, target: string) {
        if (stalker.username === target) throw new BadRequestException(["Unable to block yourself"]);
        if (stalker.blocking.some((e) => e.blockingId === target)) return;
        try {
            const targetObj = await this.getWholeUser(target);
            await this.prismaService.blockUser(stalker, targetObj.username);
            if (stalker.following.some((e) => e.followingId === target)) this.unfollowUser(stalker, target, false);
            const targetUserEntry = await this.prismaService.getWholeUser(target);
            if (targetUserEntry.following.some((e) => e.followingId === stalker.username)) this.unfollowUser(targetObj, stalker.username);
            this.wsService.notifyIfConnected([stalker.username, target], "fetch_me", null);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
    async unblockUser(stalker: UserWhole, target: string) {
        if (stalker.username === target) throw new BadRequestException(["Unable to unblock yourself"]);
        let res = stalker.blocking.find((e) => e.blockingId === target);
        if (res !== undefined) {
            try {
                await this.prismaService.unBlockUser(res.id);
                this.wsService.notifyIfConnected([stalker.username, target], "fetch_me", null);
            } catch (error) {
                throw new BadRequestException(error.message);
            }
        }
    }

    async toggle2FA(user: UserWhole, value: boolean) {
        await this.prismaService.toggle2FA(user.email, value);
    }

    async setRefreshToken(refreshToken: string, name: string) {
        const HashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prismaService.setRefreshToken(HashedRefreshToken, name);
    }

    async addAvatar(username: string, path: string) {
        return await this.prismaService.addAvatar(username, path);
    }

    async setNewPassword(newpassword: string, name: string) {
        const Hashednewpassword = await bcrypt.hash(newpassword, 10);
        await this.prismaService.setNewPassword(Hashednewpassword, name);
    }
    async updateUsername(username: string, alias: string) {
        return await this.prismaService
            .updateUsername(username, alias)
            .then(() => {
                this.wsService.userSockets.updateUsername(username, alias);
                this.wsService.userSockets.broadcast("fetch_me");
            })
            .catch((error) => {
                throw new BadRequestException(["Username must be unique"]);
            });
    }
    async getAllUsernames(username: string) {
        return await this.prismaService.getAllUsernames(username);
    }
    async getAllUsers() {
        return await this.prismaService.getAllWholeUsers();
    }
}
