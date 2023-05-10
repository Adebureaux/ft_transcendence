import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { Server, Socket } from "socket.io";
import UneGame from "./game.class";
import { Game } from "@prisma/client";
import { running_game } from "../../utils/types/ws.output.types";
import { GameInvitePayload, GameOptions } from "../../utils/dto/ws.input.dto";
import UsersSockets from "../sockets.class";

type GameObject = {
    game: UneGame;
    data: Game;
    spectators: Map<string, Socket>;
    map: string;
};

@Injectable()
export class GameService {
    private gamesMap = new Map<string, GameObject>();
    private waitingList = new Map<string, Set<Socket>>();
    private playerInMatchMaking = new Set<string>();
    public server: Server = null;
    public userSockets: UsersSockets;

    constructor(private readonly prismaService: PrismaService) {}

    getRunningGames() {
        let games: running_game[] = [];
        this.gamesMap.forEach((gameobj: GameObject, gameId: string) => {
            const obj: running_game = {
                gameId,
                startedAt: gameobj.data.startedAt,
                playerOneName: gameobj.data.playerOneName,
                playerTwoName: gameobj.data.playerTwoName,
                map: gameobj.map,
            };
            games.push(obj);
        });
        return games;
    }
    isTargetBusy(username: string): boolean {
        const runningGames = this.getRunningGames();
        return runningGames.find((game) => game.playerOneName === username || game.playerTwoName === username) ? true : false;
    }

    handleMatchMakingRequest(client: Socket, data: GameInvitePayload) {
        if (!this.playerInMatchMaking.has(client.data.email)) {
            this.playerInMatchMaking.add(client.data.email);
            if (!this.waitingList.has(JSON.stringify({ difficulty: data.difficulty, map: data.map } as any)))
                this.waitingList.set(JSON.stringify({ difficulty: data.difficulty, map: data.map } as any) as any, new Set<Socket>([client]));
            else this.waitingList.get(JSON.stringify({ difficulty: data.difficulty, map: data.map } as any)).add(client); // as any, new Array<Socket>(client))
            const cbCancel = () => {
                client.removeListener("disconnect", cbCancelDeco);
                this.cancelMatchmaking(client);
            };
            const cbCancelDeco = () => {
                client.removeListener("matchmaking-canceled", cbCancel);
                this.cancelMatchmaking(client);
            };
            client.once("matchmaking-canceled", cbCancel);
            client.once("disconnect", cbCancelDeco);
            this.tryCreateMatchmakingGame();
        } else {
            client.emit("already-in-matchmacking");
        }
    }

    cancelMatchmaking(client: Socket) {
        this.playerInMatchMaking.delete(client.data.email);
        for (const [key, value] of this.waitingList) {
            if (value) {
                this.waitingList.get(key).delete(client);
            }
        }
    }

    tryCreateMatchmakingGame() {
        for (const [key, value] of this.waitingList) {
            while (value.size >= 2) {
                let setit = Array.from(value.values());
                let user1 = setit[0];
                let user2 = setit[1];
                this.waitingList.get(key).delete(user1);
                this.waitingList.get(key).delete(user2);
                this.playerInMatchMaking.delete(user1.data.email);
                this.playerInMatchMaking.delete(user2.data.email);
                this.createGame(user1, user2, JSON.parse(key));
            }
        }
    }

    gameAnnounce() {
        const games = this.getRunningGames();
        this.server.emit("game-announcement", games);
        let userInGames: any[] = [];
        if (games.length > 0) {
            games.forEach((game: running_game) => {
                userInGames.push({ username: game.playerOneName, gameId: game.gameId, map: game.map });
                userInGames.push({ username: game.playerTwoName, gameId: game.gameId, map: game.map });
            });
        }
        this.server.emit("users-in-game-announcement", userInGames);
    }

    userInGameAnnounceStandalone() {
        const games = this.getRunningGames();
        let userInGames: any[] = [];
        if (games.length > 0) {
            games.forEach((game: running_game) => {
                userInGames.push({ username: game.playerOneName, gameId: game.gameId, map: game.map });
                userInGames.push({ username: game.playerTwoName, gameId: game.gameId, map: game.map });
            });
        }
        this.server.emit("users-in-game-announcement", userInGames);
    }

    async createGame(socketP1: Socket, socketP2: Socket, options: GameOptions) {
        const playerOneUsername = socketP1.data.username;
        const playerTwoUsername = socketP2.data.username;
        const gameEntry: Game = await this.prismaService.game.create({
            data: { playerOneName: playerOneUsername, playerTwoName: playerTwoUsername },
        });
        try {
            socketP1.data.status = "INGAME";
            socketP2.data.status = "INGAME";
            this.server.emit("users-status", this.userSockets.usersStatus);
            const game = new UneGame(gameEntry.id, socketP1, socketP2, this.server, options);
            this.gamesMap.set(gameEntry.id, { game, data: gameEntry, spectators: new Map<string, Socket>(), map: options.map });
            this.gameAnnounce();
            const gameResult: any = await game.startGame();
            socketP1.data.status = "ONLINE";
            socketP2.data.status = "ONLINE";
            this.server.emit("users-status", this.userSockets.usersStatus);
            await this.setScoresInDB(socketP1.data.username, socketP2.data.username, gameResult, gameEntry.id);
            this.gamesMap.delete(gameEntry.id);
            this.gameAnnounce();
        } catch (error) {
            if (socketP1?.connected) socketP1.data.status = "ONLINE";
            if (socketP2?.connected) socketP2.data.status = "ONLINE";
            this.server.emit("users-status", this.userSockets.usersStatus);
            await this.prismaService.game.delete({ where: { id: gameEntry.id } });
            this.gamesMap.delete(gameEntry.id);
            this.gameAnnounce();
        }
    }

    async setScoresInDB(playerOneUsername: string, playerTwoUsername: string, gameResult: any, gameId: string) {
        const player1Scores = await this.getPlayerScores(playerOneUsername);
        const player2Scores = await this.getPlayerScores(playerTwoUsername);
        // https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#atomic-number-operations

        if (gameResult.score_playerOne > gameResult.score_playerTwo) {
            await this.prismaService.$transaction([
                this.prismaService.game.update({
                    where: { id: gameId },
                    data: gameResult,
                }),
                this.prismaService.user.update({
                    where: { username: playerOneUsername },
                    data: { victoriesAsPOne: player1Scores.victoriesAsPOne + 1 },
                }),
                this.prismaService.user.update({
                    where: { username: playerTwoUsername },
                    data: { defeatsAsPTwo: player2Scores.defeatsAsPTwo + 1 },
                }),
            ]);
        } else {
            await this.prismaService.$transaction([
                this.prismaService.game.update({
                    where: { id: gameId },
                    data: gameResult,
                }),
                this.prismaService.user.update({
                    where: { username: playerOneUsername },
                    data: { defeatsAsPOne: player1Scores.defeatsAsPOne + 1 },
                }),
                this.prismaService.user.update({
                    where: { username: playerTwoUsername },
                    data: { victoriesAsPTwo: player2Scores.victoriesAsPTwo + 1 },
                }),
            ]);
        }
    }

    addSpectator(spectator: Socket, gameid: string) {
        spectator.data.status = "WATCHING";
        spectator.join(gameid);
    }

    removeSpectator(spectator: Socket, gameid: string) {
        spectator.data.status = "ONLINE";
        spectator.leave(gameid);
    }
    async getPlayerScores(username: string) {
        return await this.prismaService.user.findFirstOrThrow({
            where: { username: username },
            select: {
                victoriesAsPOne: true,
                victoriesAsPTwo: true,
                defeatsAsPOne: true,
                defeatsAsPTwo: true,
            },
        });
    }

    gameInvite(client: Socket, data: GameInvitePayload) {
        let canceled: boolean = false;
        if (!this.isTargetBusy(data.target_user) && this.userSockets.getUserSockets(data.target_user) && client.data.username !== data.target_user) {
            const room = client.id + "game-invite";
            const onGameInviteCanceled = () => {
                this.userSockets.emitToUser(data.target_user, "game-invite-canceled", "CANCELED");
                canceled = true;
            };
            const onDisconnect = () => {
                this.userSockets.emitToUser(data.target_user, "game-invite-canceled", "CANCELED");
                canceled = true;
            };
            this.userSockets.joinUser(data.target_user, room);
            client.once("game-invite-canceled", onGameInviteCanceled);
            client.once("disconnect", onDisconnect);
            const targetSockets = this.userSockets.getUserSockets(data.target_user);
            if (!targetSockets) {
                client.removeListener("game-invite-canceled", onGameInviteCanceled);
                client.removeListener("disconnect", onDisconnect);
                client.emit("game-invite-canceled", "CANCELED");
                return;
            }
            const PromisesArray: Promise<any>[] = [];
            targetSockets.forEach((socket) => {
                PromisesArray.push(
                    new Promise((resolve, reject) => {
                        socket.once("disconnect", () => {
                            reject({ res: "DISCONNECTED", socket });
                        });
                    })
                );
            });
            targetSockets.forEach((socket) => {
                PromisesArray.push(
                    new Promise((resolve, reject) => {
                        socket.timeout(30000).volatile.emit("game-invite", { ...data, from: client.data.username }, async (err, response) => {
                            if (err) {
                                reject({ res: "TIMEOUT", socket });
                            }
                            if (canceled) {
                                reject({ res: "CANCELED", socket });
                            }
                            if (response === "ACCEPTED") {
                                resolve({ res: "ACCEPTED", socket });
                            } else if (response === "DECLINED") {
                                reject({ res: "DECLINED", socket });
                            }
                        });
                    })
                );
            });
            Promise.race(PromisesArray)
                .then((res) => {
                    client.emit("game-invite-accepted");
                    this.createGame(client, res.socket, { difficulty: data.difficulty, map: data.map } as any);
                    targetSockets.forEach((socket) => {
                        if (socket.id != res.socket.id) socket.emit("game-invite-canceled", "CANCELED");
                    });
                })
                .catch((res) => {
                    this.userSockets.emitToUser(data.target_user, "game-invite-canceled", res.res);
                    client.emit("game-invite-declined", res.res);
                });
            this.userSockets.leaveUser(data.target_user, room);
        } else {
            client.emit("game-invite-declined", "NOT_CONNECTED");
        }
    }
}
