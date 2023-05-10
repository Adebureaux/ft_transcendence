import { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server } from "socket.io";

class WsEngine extends Server {
    constructor() {
        super();
    }
}

export class WsSocketAdapter extends IoAdapter {
    constructor(app: INestApplicationContext) {
        super(app);
    }

    createIOServer(port: number, options?: any): Server {
        options ? (options.server = new WsEngine()) : { ...options, server: new WsEngine() };
        const server: Server = super.createIOServer(port, options);
        return server;
    }
}
