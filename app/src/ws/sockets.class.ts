import { Socket } from "socket.io";
type SocketMap = Map<string, Socket>;
type SocketMapMap = Map<string, SocketMap>;

export default class UsersSockets {
    private map: SocketMapMap;
    constructor() {
        this.map = new Map();
    }
    get users() {
        return this.map;
    }
    addUser(socket: Socket) {
        socket.data.status = "ONLINE";
        if (!this.map.has(socket.data.username)) {
            this.map.set(socket.data.username, new Map<string, Socket>().set(socket.id, socket));
        } else {
            this.map.get(socket.data.username).set(socket.id, socket);
        }
    }

    removeSocket(socket: Socket) {
        if (this.map.has(socket.data.username)) {
            socket.disconnect(true);
            this.map.get(socket.data.username).delete(socket.id);
            if (this.map.get(socket.data.username).size === 0) {
                this.map.delete(socket.data.username);
                return true;
            }
        }
        return false;
    }
    removeUser(socket: Socket) {
        if (this.map.has(socket.data.username)) {
            this.map.get(socket.data.username)?.forEach((s) => {
                s.disconnect(true);
            });
            this.map.delete(socket.data.username);
        }
    }

    getUserSockets(username: string): SocketMap | undefined {
        return this.map.get(username);
    }

    joinUser(username: string, roomId: string) {
        this.getUserSockets(username)?.forEach((socket: Socket) => socket.join(roomId));
    }

    leaveUser(username: string, roomId: string) {
        this.getUserSockets(username)?.forEach((socket: Socket) => socket.leave(roomId));
    }

    forceDisconnectUser(username: string) {
        this.getUserSockets(username)?.forEach((socket: Socket) => {
            socket.volatile.emit("logout");
            socket.disconnect(true);
        });
    }
    log(username: string) {
        let arr = [];
        this.getUserSockets(username)?.forEach((socket: Socket) => {
            arr.push(`\nusername: ${socket.data.username}, id: ${socket.id}, status: ${socket.data.status}`);
        });
        return arr;
    }

    disconnectUser(username: string) {
        this.getUserSockets(username)?.forEach((socket: Socket) => socket.disconnect());
    }

    emitToUser(username: string, event: string, data: any | undefined = undefined) {
        this.getUserSockets(username)?.forEach((socket: Socket) => socket.emit(event, data));
    }
    broadcast(event: string, data: any | undefined = undefined) {
        this.map.forEach((map) => {
            map.forEach((socket) => {
                socket.emit(event, data);
            });
        });
    }

    emitToUserCb(username: string, event: string, data: any | undefined, cb: Function) {
        this.getUserSockets(username)?.forEach((socket: Socket) => socket.emit(event, data, cb));
    }
    setCurrentChannelToSocket(username: string, socketId: string, channelId: string | null | undefined) {
        let socket = this.getUserSockets(username)?.get(socketId);
        if (socket?.connected) {
            if (socket.data.current_channel) {
                socket.leave(socket.data.current_channel);
                socket.data.current_channel = null;
            }
            if (channelId) socket.join(channelId);
            socket.data.current_channel = channelId;
            return;
        }
    }
    updateUsername(username: string, newUsername: string): void {
        let sockets = this.getUserSockets(username);
        sockets.forEach((socket: Socket) => {
            socket.data.username = newUsername;
        });
        this.map.set(newUsername, sockets);
        this.map.delete(username);
    }
    setUserStatus(username: string, socketId: string, status: string | null | undefined = "ONLINE") {
        this.getUserSockets(username).forEach((socket: Socket) => {
            socket.data.status = status;
        });
    }

    getUserStatus(username: string): string {
        let ret = "OFFLINE";
        this.getUserSockets(username).forEach((socket: Socket) => {
            if (ret !== "INGAME" && ret !== "WATCHING") ret = socket.data.status;
        });
        return ret;
    }
    getUserStatusRaw(m: SocketMap): string {
        let ret = "OFFLINE";
        m?.forEach((socket: Socket) => {
            if ((ret !== "INGAME" && ret !== "WATCHING") || socket.data.status === "INGAME") ret = socket.data.status;
        });
        return ret;
    }
    get usersStatus(): { username: string; status: string }[] {
        let arr: { username: string; status: string }[] = [];
        this.map.forEach((m: SocketMap, username) => {
            arr.push({ username, status: this.getUserStatusRaw(m) });
        });
        return arr;
    }
}
