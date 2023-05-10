import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Req, UseFilters, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import JwtAuthGuard from "../../auth/guard/jwt-auth.guard";
import { IRequestWithUser } from "src/auth/auths.interface";
import { ChannelCreationDto, ChannelSettingsDto, UserStateDTO, IdDto, UsernameDto } from "src/utils/dto/users.dto";
import { ChannelType, State } from "@prisma/client";
import { JoinRequestDto, NewMessageDto } from "src/utils/dto/ws.input.dto";
import { TooLargeFilter } from "src/utils/filters/redirection.filter";
@UseFilters(TooLargeFilter)
@UseGuards(JwtAuthGuard)
@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post("channel")
    @HttpCode(205)
    async createChannel(@Req() request: IRequestWithUser, @Body() payload: ChannelCreationDto) {
        return this.chatService.createChannel(request.user.username, payload);
    }

    @Get(":id")
    async get(@Req() request: IRequestWithUser, @Param() channelId: IdDto) {
        const chan = request.user.channelSubscriptions.find((x) => x.channelId === channelId.id);
        if (chan) {
            if (chan.channel.channelType === ChannelType.ONE_TO_ONE) {
                const username2 = chan.channel.subscribedUsers[0].username === request.user.username ? chan.channel.subscribedUsers[1].username : chan.channel.subscribedUsers[0].username;
                const res = request.user.followedBy.map((e) => e.followerId).includes(username2) && request.user.following.map((e) => e.followingId).includes(username2);
                if (!res) {
                    throw new NotFoundException(["Channel not found"]);
                }
            }
            return true;
        }
        throw new NotFoundException(["Channel not found"]);
    }

    @Get(":id/:username/state/reset")
    async resetUserStateFromChannel(@Req() request: IRequestWithUser, @Param() channelId: IdDto, @Param() userTo: UsernameDto) {
        return this.chatService.alterUserStateInChannel(channelId.id, request.user.username, userTo.username, {
            stateTo: State.OK,
            duration: null,
        });
    }
    @Post(":id/:username/state")
    async setUserStateFromChannel(@Req() request: IRequestWithUser, @Body() stateDTO: UserStateDTO, @Param() channelId: IdDto, @Param() userTo: UsernameDto) {
        return this.chatService.alterUserStateInChannel(channelId.id, request.user.username, userTo.username, stateDTO);
    }

    @Patch(":id/settings")
    @HttpCode(205)
    async alterChannelSettings(@Req() request: IRequestWithUser, @Body() settings: ChannelSettingsDto, @Param() channelId: IdDto) {
        return this.chatService.alterChannelSettings(channelId.id, request.user.username, settings);
    }
    @Post(":id/message")
    async newMessage(@Req() request: IRequestWithUser, @Body() message: NewMessageDto, @Param() channelId: IdDto) {
        return this.chatService.newMessage(request.user, channelId.id, message);
    }
    @Post(":id/join")
    async joinChannelHttp(@Req() request: IRequestWithUser, @Body() joinRequest: JoinRequestDto, @Param() dto: IdDto) {
        return this.chatService.joinChannelHttp(request.user, dto.id, joinRequest);
    }
    @Patch("leave")
    async leaveChannelHttp(@Req() request: IRequestWithUser, @Body() joinRequest: JoinRequestDto) {
        return this.chatService.leaveChannelHttp(request.user.username, joinRequest);
    }

    @Delete(":id")
    @HttpCode(205)
    async deleteChannelSubscriptionHttp(@Req() request: IRequestWithUser, @Param() channelId: IdDto) {
        return this.chatService.deleteChannelSubscriptionHttp(request.user, channelId.id);
    }
}
