import { Global, Injectable } from "@nestjs/common";
import { Server } from "socket.io";
import UsersSockets from "./sockets.class";

@Global()
@Injectable()
export class WsService {
    public server: Server = null;
    public userSockets: UsersSockets;
    constructor() {}

    notifyIfConnected(usernames: string[], eventName: string, eventData: any) {
        usernames.forEach((username) => {
            this.userSockets.emitToUser(username, eventName, eventData);
        });
    }
}
