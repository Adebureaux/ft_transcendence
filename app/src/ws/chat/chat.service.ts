import { BadRequestException, Injectable, Logger, ForbiddenException, MisdirectedException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Server, Socket } from "socket.io";
import { IJoinRequestDto, NewMessageDto, ReceivedLeaveRequest } from "src/utils/dto/ws.input.dto";
import * as bcrypt from "bcrypt";
import { Channel, ChannelType, Role, State, Message, Subscription, Blocks } from "@prisma/client";
import { ChannelSettingsDto, ChannelCreationDto, UserStateDTO } from "src/utils/dto/users.dto";
import { SubInfosWithChannelAndUsers, SubInfosWithChannelAndUsersAndMessages } from "src/utils/types/chat.queries";
import { filterInferiorRole, throwIfRoleIsInferiorOrEqualToTarget } from "src/utils/helpers/roles-helper";
import { SchedulerRegistry } from "@nestjs/schedule";
import { UserWhole } from "src/utils/types/users.types";
import UsersSockets from "../sockets.class";
import { ICommand, parseCommand } from "./minishell";

@Injectable()
export class ChatService {
    public server: Server = null;
    private readonly logger = new Logger(ChatService.name);
    public userSockets: UsersSockets;

    constructor(private readonly prismaService: PrismaService, private readonly schedulerRegistry: SchedulerRegistry) {
        setTimeout(() => {
            this.__resumeScheduleStateResets();
        }, 2000);
    }

    async joinChannelHttp(user: UserWhole, channelId: string, joinInfos: IJoinRequestDto): Promise<SubInfosWithChannelAndUsersAndMessages> {
        const infos_user: SubInfosWithChannelAndUsersAndMessages = await this.getSubInfosWithChannelAndUsersAndMessages(user.username, channelId);
        if (infos_user.state === State.BANNED) {
            throw new ForbiddenException([`You are ${infos_user.state} in this channel!`]);
        }
        if (!(await this.filterBadPassword(joinInfos.password, infos_user.channel.hash))) throw new ForbiddenException([`wrong password`]);
        if (infos_user.channel.channelType === ChannelType.ONE_TO_ONE) {
            const username2 = infos_user.channel.subscribedUsers[0].username === user.username ? infos_user.channel.subscribedUsers[1].username : infos_user.channel.subscribedUsers[0].username;
            if (!(user.followedBy.map((e) => e.followerId).includes(username2) && user.following.map((e) => e.followingId).includes(username2))) {
                throw new ForbiddenException([`You are not allowed to join this channel`]);
            }
        }
        try {
            this.userSockets.setCurrentChannelToSocket(user.username, joinInfos.socketId, channelId);
        } catch (e) {
            throw new MisdirectedException(["You appear to not be connected via websocket"]);
        }
        return infos_user;
    }

    async leaveChannelHttp(username: string, d: IJoinRequestDto) {
        this.userSockets.setCurrentChannelToSocket(username, d.socketId, null);
    }

    async leaveChannel(client: Socket, data: ReceivedLeaveRequest): Promise<void> {
        this.logger.verbose(`${client.data.username} left channel: ${data.channelId}`);
        client.leave(data.channelId);
    }

    async filterBadPassword(password: string, hash: string): Promise<boolean> {
        if (!hash) return true;
        const hash_check = await bcrypt.compare(password, hash).catch(() => {
            throw new ForbiddenException(["wrong password"]);
        });
        if (!hash_check) throw new ForbiddenException(["wrong password"]);
        return hash_check;
    }

    sendPrivateMessageNotification(user: UserWhole, infos_user: SubInfosWithChannelAndUsers, message: Message): void {
        const friendUsername: string =
            infos_user.channel.subscribedUsers[0].username === user.username ? infos_user.channel.subscribedUsers[1].username : infos_user.channel.subscribedUsers[0].username;
        this.userSockets.getUserSockets(friendUsername)?.forEach((sock) => {
            if (sock?.data.current_channel !== infos_user.channelId) {
                sock?.emit("notifmessage", {
                    username: user.username,
                    message: message.content,
                });
            }
        });
    }

    sendMessageToNotBlockedByIfConnected(user: UserWhole, channelId: string, message: Message): void {
        const blocking = user.blockedBy.map((e) => e.blockerId);
        this.userSockets.users.forEach((map, username) => {
            if (!blocking?.includes(username)) {
                map.forEach((entry) => {
                    if (entry.rooms.has(channelId)) {
                        entry.emit("message", message);
                    }
                });
            }
        });
    }

    async kickUserFromChannel(channelId: string, targets: string[], reason: string | undefined = undefined): Promise<void> {
        targets.forEach((target: any) => {
            this.userSockets.getUserSockets(target)?.forEach((target_socket) => {
                if (target_socket?.data.current_channel === channelId) {
                    target_socket?.leave(channelId);
                    target_socket?.emit("kick", { channelId, reason });
                    target_socket.data.current_channel = null;
                }
            });
        });
    }

    async createChannel(username: string, channelCreationDto: ChannelCreationDto): Promise<Channel> {
        let hashedPassword = "";
        if (channelCreationDto?.password) hashedPassword = await bcrypt.hash(channelCreationDto.password, 10);
        let userArray: any[] = [{ username: username, role: Role.OWNER }];
        if (channelCreationDto.channelType === ChannelType.PRIVATE) {
            channelCreationDto?.usernames.forEach((user) => {
                userArray.push({ username: user.username, role: Role.USER });
            });
        } else if (channelCreationDto.channelType === ChannelType.PUBLIC) {
            const allUsers = await this.prismaService.getAllUsernames(username);
            allUsers.forEach((user) => {
                userArray.push({ username: user.username, role: Role.USER });
            });
        } else {
            throw new BadRequestException(["Invalid channel payload"]);
        }
        const res = await this.prismaService.createChannel(channelCreationDto.name, channelCreationDto.channelType, hashedPassword, userArray).catch((err) => {
            throw new BadRequestException(["Invalid channel options, could not create channel"]);
        });
        this.notifyIfConnected(
            res.subscribedUsers.map((u: Subscription) => u.username),
            "fetch_me",
            null
        );
        return res;
    }

    async alterUserStateInChannel(channelId: string, user_initiator: string | SubInfosWithChannelAndUsers, target: string, userStateDTO: UserStateDTO): Promise<Subscription> {
        let infos_initiator: SubInfosWithChannelAndUsers;
        if (typeof user_initiator === "string") infos_initiator = await this.getSubInfosWithChannelAndUsers(user_initiator, channelId);
        else infos_initiator = user_initiator;
        filterInferiorRole(infos_initiator.role, Role.ADMIN);
        const infos_target = infos_initiator.channel.subscribedUsers.find((x) => x.username === target);
        throwIfRoleIsInferiorOrEqualToTarget(infos_initiator.role, infos_target.role);
        let alteration: any = {};
        if (userStateDTO.stateTo === State.OK) {
            alteration = { state: userStateDTO.stateTo, stateActiveUntil: null };
        } else {
            // en vrai on peut ban qqun pour une nouvelle durée
            // if (infos_target.state === State.BANNED && userStateDTO.stateTo === State.BANNED) throw new BadRequestException(["Cannot ban a banned user"]);
            const cdate = new Date();
            cdate.setTime(userStateDTO.duration * 60 * 1000 + new Date().getTime());
            alteration = { state: userStateDTO.stateTo, stateActiveUntil: cdate };
        }
        const alteredSubscription: Subscription = await this.prismaService.subscription
            .update({
                where: { id: infos_target.id },
                data: alteration,
            })
            .catch((e) => {
                throw new BadRequestException(["Prisma: Invalid sub payload, target must have left the channel", e.message]);
            });
        this.server.in(channelId).emit("altered_subscription", alteredSubscription);
        if (alteredSubscription.state === State.BANNED) {
            this.userSockets.emitToUser(target, "fetch_me");
            this.kickUserFromChannel(channelId, [target], "You have been BANNED from this channel");
        } else this.userSockets.emitToUser(target, "fetch_me");
        if (alteredSubscription.state !== State.OK) this.addScheduledStateAlteration(alteredSubscription);
        return alteredSubscription;
    }

    private async getSubInfosWithChannelAndUsers(username: string, channelId: string): Promise<SubInfosWithChannelAndUsers> {
        const infos: SubInfosWithChannelAndUsers = await this.prismaService.getSubInfosWithChannelAndUsers(username, channelId).catch((e) => {
            throw new ForbiddenException(["User not subscribed to channel | Channel not found", e.message]);
        });
        return infos;
    }
    private async getSubInfosWithChannelAndUsersAndMessages(username: string, channelId: string): Promise<SubInfosWithChannelAndUsersAndMessages> {
        const infos: SubInfosWithChannelAndUsersAndMessages = await this.prismaService.getSubInfosWithChannelAndUsersAndMessages(username, channelId).catch((e) => {
            throw new ForbiddenException(["User not subscribed to channel | Channel not found", e.message]);
        });
        return infos;
    }

    addScheduledStateAlteration(altered_subscription: Subscription): void {
        const now = Date.now();
        const action = async () => {
            return await this.__scheduledSubscriptionAlteration(altered_subscription, now).catch((e) => {});
        };
        try {
            this.schedulerRegistry.deleteTimeout(altered_subscription.id);
        } catch (e) {}
        const time_in_milliseconds = altered_subscription.stateActiveUntil.getTime() - now;
        if (time_in_milliseconds > 500) {
            const timeout = setTimeout(action.bind(this), time_in_milliseconds);
            this.schedulerRegistry.addTimeout(altered_subscription.id, timeout);
        } else {
            action();
        }
    }

    private async __scheduledSubscriptionAlteration(altered_subscription: Subscription, createdAt: number = 0): Promise<void> {
        if (createdAt === 0) createdAt = Date.now();
        const res = await this.prismaService.subscription.update({
            where: { id: altered_subscription.id },
            data: {
                state: State.OK,
                stateActiveUntil: null,
            },
        });
        this.server.in(altered_subscription.channelId).emit("altered_subscription", res);
        this.userSockets.emitToUser(altered_subscription.username, "fetch_me");
    }

    private async __resumeScheduleStateResets(): Promise<void> {
        const altered_subscriptions: Subscription[] = await this.prismaService.subscription.findMany({
            where: {
                OR: [{ state: State.BANNED }, { state: State.MUTED }],
            },
        });
        altered_subscriptions.forEach((subscription) => {
            const time_in_milliseconds = new Date(subscription.stateActiveUntil).getTime() - Date.now();
            if (time_in_milliseconds <= 1000) {
                this.prismaService.subscription
                    .update({
                        where: { id: subscription.id },
                        data: { state: State.OK, stateActiveUntil: null },
                    })
                    .catch((e) => {});
            } else {
                this.addScheduledStateAlteration(subscription);
            }
        });
    }

    async alterChannelSettings(channel_id: string, initiator: string, settings: ChannelSettingsDto): Promise<SubInfosWithChannelAndUsers> {
        let channel_changed: boolean = false;
        const infos_initiator: SubInfosWithChannelAndUsers = await this.getSubInfosWithChannelAndUsers(initiator, channel_id);
        filterInferiorRole(infos_initiator.role, Role.OWNER);
        const existing_subscriptions: string[] = infos_initiator.channel.subscribedUsers.map((sub) => sub.username);
        const subscription_to_remove: any[] = infos_initiator.channel.subscribedUsers.filter((sub) => sub.username !== initiator && !settings.usernames.includes(sub.username));
        const subscription_to_add: string[] = settings.usernames.filter((sub) => !existing_subscriptions.includes(sub));
        if (infos_initiator.channel.channelType === ChannelType.PRIVATE) {
            if (subscription_to_remove.length > 0) {
                await this.prismaService.subscription
                    .deleteMany({
                        where: {
                            OR: subscription_to_remove.map((sub) => {
                                return { id: sub.id, username: sub.username };
                            }),
                        },
                    })
                    .then(async (e: any) => {
                        const usernames: string[] = subscription_to_remove.map((e: any) => {
                            return e.username;
                        });
                        await this.kickUserFromChannel(channel_id, usernames, "You have been removed from this channel.");
                        this.notifyIfConnected(usernames, "fetch_me", null);
                    })
                    .catch((err) => {
                        throw new BadRequestException(["Could not delete subscriptions", err.message]);
                    });
                channel_changed = true;
            }
            if (subscription_to_add.length > 0) {
                await this.prismaService.subscription
                    .createMany({
                        data: subscription_to_add.map((sub) => {
                            return {
                                channelId: channel_id,
                                username: sub,
                                role: Role.USER,
                                state: State.OK,
                                stateActiveUntil: null,
                            };
                        }),
                    })
                    .catch((err) => {
                        throw new BadRequestException(["Could not create subscriptions", err.message]);
                    });
                channel_changed = true;
            }
        }
        if (settings.change_password) {
            if (settings.password) {
                const hash_password = await bcrypt.hash(settings.password, 10);
                await this.prismaService.channel.update({ where: { id: channel_id }, data: { hash: hash_password, passwordProtected: true } }).catch((err) => {
                    throw new BadRequestException(["Could not modify password", err.message]);
                });
                channel_changed = true;
            } else {
                await this.prismaService.channel.update({ where: { id: channel_id }, data: { hash: null, passwordProtected: false } }).catch((err) => {
                    throw new BadRequestException(["Could not modify password", err.message]);
                });
                channel_changed = true;
            }
            channel_changed = true;
        }
        if (channel_changed) {
            const altered_subscriptions = await this.prismaService.subscription.findMany({ where: { channelId: channel_id } });
            if (settings.change_password) {
                altered_subscriptions.forEach((subscription) => {
                    this.kickUserFromChannel(channel_id, [subscription.username], "The channel's password has been changed.");
                    this.userSockets.emitToUser(subscription.username, "fetch_me");
                });
            } else
                this.notifyIfConnected(
                    altered_subscriptions.map((sub) => sub.username),
                    "fetch_me",
                    null
                );
        }
        return await this.getSubInfosWithChannelAndUsers(initiator, channel_id);
    }

    notifyIfConnected(usernames: string[], eventName: string, eventData: any): void {
        usernames.forEach((username) => {
            this.userSockets.emitToUser(username, eventName, eventData);
        });
    }
    async deleteChannelSubscriptionHttp(user: UserWhole, channel_id: string): Promise<void> {
        const infos_initiator: SubInfosWithChannelAndUsers = await this.getSubInfosWithChannelAndUsers(user.username, channel_id);
        if (infos_initiator.channel.channelType === ChannelType.ONE_TO_ONE) throw new ForbiddenException(["Cannot delete this type of channel subscription"]);
        if (infos_initiator.role === Role.OWNER) {
            await this.prismaService.channel.delete({ where: { id: channel_id } });
            infos_initiator.channel.subscribedUsers.forEach((sub) => {
                this.kickUserFromChannel(channel_id, [sub.username], "Channel deleted.");
            });
            infos_initiator.channel.subscribedUsers.map((sub) => this.userSockets.emitToUser(sub.username, "channel_deleted", channel_id));
        } else if (infos_initiator.channel.channelType === ChannelType.PRIVATE) {
            await this.prismaService.subscription.delete({ where: { id: infos_initiator.id } });
            this.kickUserFromChannel(channel_id, [infos_initiator.username], "Successfully deleted subscription.");
            this.userSockets.emitToUser(user.username, "channel_deleted", channel_id);
            this.server.to(channel_id).emit("fetch_me");
        } else throw new ForbiddenException(["Cannot delete this type of channel subscription"]);
    }
    async newMessage(user: UserWhole, channelId: string, messageDto: NewMessageDto): Promise<void | boolean> {
        const infos_user: SubInfosWithChannelAndUsers = await this.getSubInfosWithChannelAndUsers(user.username, channelId);
        if (infos_user.channel.channelType === ChannelType.ONE_TO_ONE) {
            const username2 = infos_user.channel.subscribedUsers[0].username === user.username ? infos_user.channel.subscribedUsers[1].username : infos_user.channel.subscribedUsers[0].username;
            if (!(user.followedBy.map((e) => e.followerId).includes(username2) && user.following.map((e) => e.followingId).includes(username2))) {
                this.server.to(messageDto.socketId).emit("command_result", {
                    type: "negative",
                    message: `You are not allowed to write in this channel`,
                });
                throw new ForbiddenException([`You are not allowed to write in this channel`]);
            }
        }
        if (!(await this.filterBadPassword(messageDto.password, infos_user.channel.hash))) throw new ForbiddenException([`wrong password`]);
        if (infos_user.state === State.BANNED || infos_user.state == State.MUTED) {
            this.server.to(messageDto.socketId).emit("command_result", {
                type: "negative",
                message: `You are ${infos_user.state} in this channel!`,
            });
            throw new ForbiddenException([`You are ${infos_user.state} in this channel!`]);
        }
        if (messageDto.content.startsWith("/")) {
            if (infos_user.role === Role.USER) {
                this.server.to(messageDto.socketId).emit("command_result", {
                    type: "negative",
                    message: `You are not allowed to send commands in this channel`,
                });
                throw new ForbiddenException([`You are not allowed to send commands in this channel`]);
            }
            return this.detectCommandInMessage(infos_user, channelId, messageDto);
        }
        // normal message
        const message: Message = await this.prismaService.createMessage(user.username, channelId, messageDto.content).catch((e) => {
            throw new BadRequestException([e.message]);
        });
        if (infos_user.channel.channelType === ChannelType.ONE_TO_ONE) {
            this.sendPrivateMessageNotification(user, infos_user, message);
        }
        this.sendMessageToNotBlockedByIfConnected(user, channelId, message);
    }

    // ############################################
    // ############################################

    async detectCommandInMessage(infos_initiator: SubInfosWithChannelAndUsers, channelId: string, messageDto: NewMessageDto): Promise<boolean> {
        try {
            const command: ICommand = parseCommand(messageDto.content);
            if (command.status === "ERROR") throw new Error(command.message_status);
            filterInferiorRole(infos_initiator.role, Role.ADMIN);
            const infos_target = infos_initiator.channel.subscribedUsers.find((x) => x.username === command.username);
            if (!infos_target) throw new Error("Target user not found");
            throwIfRoleIsInferiorOrEqualToTarget(infos_initiator.role, infos_target.role);
            const serverMessage: Message = {
                id: 0,
                CreatedAt: new Date(),
                ReceivedAt: new Date(),
                content: "",
                username: "{ SERVER }",
                channelId: channelId,
            };
            const getTimeDuration = (duration: number): Date => {
                const cdate = new Date();
                cdate.setTime(duration * 60 * 1000 + new Date().getTime());
                return cdate;
            };
            const now = new Date().getTime() / 1000;
            switch (command.name) {
                case "ban":
                    if (infos_target.state == State.BANNED && infos_target.stateActiveUntil > getTimeDuration(command.duration))
                        throw new Error(`${command.username} is already banned for a longer period, use /pardon command before`);
                    await this.kickUserFromChannel(channelId, [command.username]);
                    try {
                        await this.alterUserStateInChannel(channelId, infos_initiator, command.username, {
                            stateTo: State.BANNED,
                            duration: command.duration,
                        });
                    } catch (err: any) {
                        if (err?.response?.message) throw err.response.message;
                        throw "unable to ban user";
                    }
                    serverMessage.content = `user ${command.username} banned for ${command?.duration} minutes !`;
                    break;
                case "mute":
                    if (infos_target.state == State.MUTED && infos_target.stateActiveUntil > getTimeDuration(command.duration))
                        throw new Error(`${command.username} is already muted for a longer period, use /pardon command before`);
                    try {
                        await this.alterUserStateInChannel(channelId, infos_initiator, command.username, {
                            stateTo: State.MUTED,
                            duration: command.duration,
                        });
                    } catch (err: any) {
                        if (err?.response?.message) throw err.response.message;
                        throw "unable to mute user";
                    }
                    serverMessage.content = `user ${command.username} muted for ${command?.duration} minutes !`;
                    break;
                case "pardon":
                    if (infos_target.state === State.OK) throw new Error(`${command.username} is already perfect`);
                    await this.alterUserStateInChannel(channelId, infos_initiator, command.username, {
                        stateTo: State.OK,
                        duration: null,
                    });
                    serverMessage.content = `user ${command.username} pardoned. He can now rejoins the channel`;
                    break;
                case "kick":
                    await this.kickUserFromChannel(channelId, [command.username]);
                    serverMessage.content = `user ${command.username} kicked !`;
                    break;
                case "promote":
                    if (infos_target.role === Role.ADMIN) throw new Error(`user ${command.username} is already an ADMIN`);
                    else {
                        await this.prismaService.alterUserRole(command.username, channelId, Role.ADMIN);
                        serverMessage.content = `user ${command.username} is now an ADMIN`;
                    }
                    break;
                case "demote":
                    if (infos_target.role === Role.USER) throw new Error(`user ${command.username} is not an ADMIN`);
                    else {
                        await this.prismaService.alterUserRole(command.username, channelId, Role.USER);
                        serverMessage.content = `user ${command.username} is no longer an ADMIN`;
                    }
                    break;
            }
            this.server.to(messageDto.socketId).emit("command_result", { type: "positive", message: serverMessage.content });
            this.userSockets.broadcast("fetch_me");
        } catch (err: any) {
            let message = "Unknown command";
            if (err?.response?.message) message = err?.response?.message;
            else if (err?.message) message = err?.message;
            else if (err?.response?.data?.message) message = err?.response?.data?.message;
            this.server.to(messageDto.socketId).emit("command_result", {
                type: "negative",
                message: message,
            });
        }
        return true;
    }

    async channelExist(id: string): Promise<boolean> {
        const res = await this.prismaService.channel.findUniqueOrThrow({ where: { id } }).catch(() => {
            throw new NotFoundException(["channel not found"]);
        });
        return true;
    }
}
