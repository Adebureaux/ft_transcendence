import { Logger } from "@nestjs/common";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { ITokenPayload } from "src/auth/auths.interface";
import { GameInvitePayload } from "../utils/dto/ws.input.dto";
import { PrismaService } from "src/prisma.service";
import { GameService } from "./game/game.service";
import { ChatService } from "./chat/chat.service";
import { WsService } from "./ws.service";
import { UserWhole } from "src/utils/types/users.types";
import UsersSockets from "./sockets.class";

@WebSocketGateway({
    cors: ["*"],
    origin: ["*"],
    path: "/api/ws/",
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(WsGateway.name);
    private userSockets: UsersSockets;
    constructor(
        private readonly authService: AuthService,
        private readonly gameService: GameService,
        private readonly chatService: ChatService,
        private readonly wsService: WsService,
        private readonly prismaService: PrismaService
    ) {
        this.userSockets = new UsersSockets();
    }

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.wsService.server = this.server;
        this.gameService.server = this.server;
        this.chatService.server = this.server;

        this.chatService.userSockets = this.userSockets;
        this.wsService.userSockets = this.userSockets;
        this.gameService.userSockets = this.userSockets;

        this.logger.verbose("WsGateway Initialized");
    }

    async handleConnection(client: Socket) {
        try {
            const verifiedPayload: ITokenPayload = this.authService.verifyToken(client.handshake.auth.token);
            const userData: UserWhole = await this.prismaService.getWholeUserByEmail(verifiedPayload.email);
            client.data.username = userData.username as string;
            client.data.email = userData.email as string;
            this.userSockets.addUser(client);
            setTimeout(() => {
                this.server.emit("users-status", this.userSockets.usersStatus);
            }, 1000);
            return this.userSockets.usersStatus;
        } catch (e) {
            if (this.userSockets.removeSocket(client)) {
                this.server.emit("users-status", this.userSockets.usersStatus);
            }
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {
        if (this.userSockets.removeSocket(client)) {
            this.server.emit("users-status", this.userSockets.usersStatus);
        }
        client.disconnect(true);
    }

    @SubscribeMessage("game-invite")
    gameInvite(client: Socket, data: GameInvitePayload) {
        return this.gameService.gameInvite(client, data);
    }

    @SubscribeMessage("logout")
    logout(client: Socket) {
        this.userSockets.removeUser(client);
    }

    @SubscribeMessage("matchmaking")
    handleMatchMakingRequest(client: Socket, data: GameInvitePayload) {
        return this.gameService.handleMatchMakingRequest(client, data);
    }

    @SubscribeMessage("watch-game")
    addSpectator(client: Socket, gameId: string) {
        try {
            this.gameService.addSpectator(client, gameId);
            this.server.emit("users-status", this.userSockets.usersStatus);
        } catch (err) {
            return err;
        }
        return "OK";
    }
    @SubscribeMessage("unwatch-game")
    removeSpectator(client: Socket, gameId: string) {
        this.gameService.removeSpectator(client, gameId);
        this.server.emit("users-status", this.userSockets.usersStatus);
    }
}
