import { Injectable, OnModuleInit, INestApplication, NotFoundException, BadRequestException } from "@nestjs/common";
import { Channel, ChannelType, Role, Follows, PrismaClient, User, Message, Subscription } from "@prisma/client";
import { CreateUserDto } from "./utils/dto/users.dto";
import { IGames, UserProfile, userProfileQuery, UserWhole, userWholeQuery } from "./utils/types/users.types";
import generateChannelCompoundName from "./utils/helpers/generateChannelCompoundName";
import { SubInfosWithChannelAndUsers, SubInfosWithChannelAndUsersAndMessages, subQuery, subQueryWithMessages, whereUserIsInChannel } from "./utils/types/chat.queries";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on("beforeExit", async () => {
            await app.close();
        });
    }
    async getUser(name: string): Promise<User> {
        try {
            const user = await this.user.findUnique({ where: { username: name } });
            return user;
        } catch (error) {
            throw new NotFoundException("User not found");
        }
    }
    async getUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.user.findUnique({ where: { email: email } });
            return user;
        } catch (error) {
            throw new NotFoundException("User not found");
        }
    }
    async createUser(userDto: CreateUserDto): Promise<User> {
        try {
            const user = await this.user.create({ data: { ...userDto } });
            // subscribe the user to all publics channels
            const pubchan = await this.channel.findMany({ where: { channelType: ChannelType.PUBLIC } });
            if (pubchan.length) {
                const subs = pubchan.map((e: any) => {
                    return {
                        username: userDto.username,
                        channelId: e.id,
                    };
                });
                await this.subscription.createMany({ data: subs });
            }
            return user;
        } catch (error) {
            throw new BadRequestException("User already exists");
        }
    }
    async create42AuthUser(userDto: CreateUserDto, auth42Id: string): Promise<UserWhole> {
        try {
            const user = await this.user.create({ data: { ...userDto, auth42Id, auth42: true } });
            // subscribe the user to all publics channels
            const pubchan = await this.channel.findMany({ where: { channelType: ChannelType.PUBLIC } });
            if (pubchan.length) {
                const subs = pubchan.map((e: any) => {
                    return {
                        username: userDto.username,
                        channelId: e.id,
                    };
                });
                await this.subscription.createMany({ data: subs });
            }
            return await this.getWholeUserByEmail(user.email);
        } catch (error) {
            throw new BadRequestException("User already exists");
        }
    }

    async updateUsername(username: string, newAlias: string) {
        await this.user.update({ where: { username: username }, data: { username: newAlias } });
    }

    async deleteRefreshToken(username: string) {
        await this.user.update({
            where: { username: username },
            data: { refresh_token: null },
        });
    }
    async setRefreshToken(HashedRefreshToken: string, email: string) {
        await this.user.update({
            where: { email: email },
            data: { refresh_token: HashedRefreshToken },
        });
    }
    async toggle2FA(email: string, value: boolean) {
        await this.user.update({ where: { email: email }, data: { TwoFA: value } });
    }

    async setNewPassword(Hashednewpassword: string, name: string) {
        await this.user.update({
            where: { username: name },
            data: { password: Hashednewpassword },
        });
    }
    async addAvatar(username: string, path: string) {
        const res = await this.user.update({
            where: { username: username },
            data: {
                avatars: {
                    upsert: {
                        create: { linkOriginal: path } as any, // sorry theo
                        update: { linkOriginal: path } as any, // sorry theo
                    },
                },
            },
            include: { avatars: true },
        });
        return res.avatars;
    }
    async unfollowUser(followId: string) {
        return await this.follows.delete({ where: { id: followId } });
    }
    async followUser(stalker: UserWhole, target: string) {
        return await this.follows.create({
            data: {
                followerId: stalker.username,
                followingId: target,
            },
        });
    }

    async unBlockUser(blockId: string) {
        return await this.blocks.delete({ where: { id: blockId } });
    }

    async blockUser(blocker: UserWhole, target: string) {
        return await this.blocks.create({
            data: {
                blockerId: blocker.username,
                blockingId: target,
            },
        });
    }
    async getMatchingUserUsername(username: string) {
        return await this.user.findUnique({ where: { username: username }, select: { username: true } });
    }
    async findUsers(name: string, key: string, skipValue: number, takeValue: number) {
        const users = await this.user.findMany({
            where: {
                NOT: [{ username: name }],
                username: {
                    startsWith: key,
                    mode: "insensitive",
                },
            },
            skip: skipValue,
            take: takeValue,
            select: { username: true },
            orderBy: { username: "desc" },
        });
        const maxResults = await this.user.count({
            where: {
                NOT: [{ username: name }],
                username: {
                    startsWith: key,
                    mode: "insensitive",
                },
            },
        });
        return { total: maxResults, result: users };
    }
    async getUserGames(name: string, skipValue: number, takeValue: number, orderParam: any): Promise<IGames> {
        const queryObject = { where: { OR: [{ playerOneName: name }, { playerTwoName: name }] } };
        const games = await this.game.findMany({
            ...queryObject,
            skip: skipValue,
            take: takeValue,
            orderBy: { finishedAt: orderParam },
        });
        const maxResults = await this.game.count(queryObject);

        return { total: maxResults, result: games };
    }

    async getWholeUser(name: string): Promise<UserWhole> {
        const user = await this.user.findUniqueOrThrow({
            where: { username: name },
            ...userWholeQuery,
        });
        return user;
    }

    async getWholeUserByEmail(email: string): Promise<UserWhole> {
        const user = await this.user.findUniqueOrThrow({
            where: { email: email },
            ...userWholeQuery,
        });
        return user;
    }

    async getProfile(name: string): Promise<UserProfile> {
        const user = await this.user.findUnique({
            where: { username: name },
            ...userProfileQuery,
        });
        if (!user) throw new NotFoundException("User not found");
        return user;
    }

    async generateChannelCompoundNameByUsernames(userA: string, userB: string): Promise<string> {
        const userAEmail = await this.user.findUnique({ where: { username: userA }, select: { email: true } });
        const userBEmail = await this.user.findUnique({ where: { username: userB }, select: { email: true } });
        const compoud_channel_name = generateChannelCompoundName(userAEmail.email, userBEmail.email);
        if (!compoud_channel_name) throw new BadRequestException("invalid Compoud channel name");
        return compoud_channel_name;
    }

    async createOneToOneChannel(userA: string, userB: string) {
        const name: string = await this.generateChannelCompoundNameByUsernames(userA, userB);
        let channel: Channel = await this.channel.findUnique({
            where: { name: name },
        });
        if (!channel) {
            channel = await this.channel.create({
                data: {
                    name: name,
                    channelType: ChannelType.ONE_TO_ONE,
                    subscribedUsers: { createMany: { data: [{ username: userA }, { username: userB }] } },
                },
                include: {
                    subscribedUsers: true,
                    messages: true,
                },
            });
        }
        return channel;
    }
    async getAllUsernames(exception: string) {
        const usernames = await this.user.findMany({
            where: { NOT: [{ username: exception }] },
            select: { username: true },
        });
        return usernames;
    }

    async getAllWholeUsers() {
        const users = await this.user.findMany({
            select: {
                username: true,
                victoriesAsPOne: true,
                victoriesAsPTwo: true,
                defeatsAsPOne: true,
                defeatsAsPTwo: true,
            },
        });
        return users;
    }

    async createChannel(channelName: string, type: ChannelType, hashedPassword: string, userArray: any[]) {
        const channel = await this.channel.create({
            data: {
                name: channelName,
                channelType: type,
                subscribedUsers: { createMany: { data: userArray } },
                hash: hashedPassword,
                passwordProtected: hashedPassword && hashedPassword?.length > 0 ? true : (false as boolean),
            },
            include: {
                subscribedUsers: true,
                messages: true,
            },
        });
        delete channel.hash;
        return channel;
    }

    async getSubInfosWithChannelAndUsers(username: string, channelId: string): Promise<SubInfosWithChannelAndUsers> {
        return this.subscription.findFirstOrThrow({ where: whereUserIsInChannel(username, channelId, Role.USER), ...subQuery });
    }

    async getSubInfosWithChannelAndUsersAndMessages(username: string, channelId: string): Promise<SubInfosWithChannelAndUsersAndMessages> {
        const blockingUsernames = await this.blocks.findMany({ where: { blockerId: username }, select: { blockingId: true } });
        const blockingUsernames2 = blockingUsernames.map((e) => {
            return e.blockingId;
        });
        const res: SubInfosWithChannelAndUsersAndMessages = await this.subscription.findFirstOrThrow({ where: whereUserIsInChannel(username, channelId, Role.USER), ...subQueryWithMessages });
        res.channel.messages = res.channel.messages.filter((e) => !blockingUsernames2.includes(e.username));
        return res;
    }

    async getOneToOneChannel(username1: string, username2: string): Promise<string> {
        const name: string = await this.generateChannelCompoundNameByUsernames(username1, username2);
        let channel: Channel = await this.channel.findUnique({ where: { name: name } });
        if (!channel) return undefined;
        return channel.id;
    }

    async createMessage(username: string, channelId: string, content: string): Promise<Message> {
        const message = await this.message.create({
            data: {
                channelId: channelId,
                username: username,
                content: content,
            },
        });
        return message;
    }

    async getChannel(channelId: string) {
        return await this.channel.findFirst({
            where: { id: channelId },
        });
    }

    async isUsersFriends(usernameA: string, usernameB: string): Promise<boolean> {
        const userA = await this.getWholeUser(usernameA);
        return (
            !!userA.followedBy?.find((e: Follows) => {
                return e.followerId == usernameB;
            }) &&
            !!userA.following?.find((e: Follows) => {
                return e.followingId == usernameB;
            })
        );
    }

    async getChannelWithUsers(channelId: string) {
        return await this.channel.findFirst({
            where: { id: channelId },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updated: true,
                channelType: true,
                subscribedUsers: {
                    select: {
                        id: true,
                        role: true,
                        channel: true,
                        user: true,
                        username: true,
                        channelId: true,
                        state: true,
                        stateActiveUntil: true,
                    },
                },
                passwordProtected: true,
            },
        });
    }

    async createSubscription(channelId: string, username: string) {
        return await this.subscription.create({
            data: {
                username: username,
                channelId: channelId,
            },
        });
    }
    async alterUserRole(username: string, channelId: string, role: Role): Promise<void> {
        await this.subscription.update({ where: { username_channel: { channelId, username } }, data: { role: role } });
    }
    async setTwoFASecret(secret: string, email: string) {
        return this.user.update({ where: { email: email }, data: { TwoFASecret: secret } });
    }
}
