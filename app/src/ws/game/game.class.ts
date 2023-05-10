import { Server, Socket } from "socket.io";
import { GameOptions } from "../../utils/dto/ws.input.dto";

export default class UneGame {
    public gameId: string;
    public socketP1: Socket;
    public socketP2: Socket;
    public intervalId: NodeJS.Timer;
    private frameUpdateEventName: string;
    private MouseMoveEventName: string;
    private AskpauseEventName: string;
    private pauseP1: boolean;
    private pauseP2: boolean;

    private max_score: number = 7;
    private game_paused: boolean = true;
    private player_height: number = 100;
    private player_width: number = 8;

    private ball_x: number = 550;
    private ball_y: number = 360;
    private speed_constant: number = 5;
    private ball_speed_x: number = this.speed_constant;
    private ball_speed_y: number = Math.random() * this.speed_constant;

    private player_one_y: number = 310;
    private player_one_score: number = 0;
    private player_two_y: number = 310;
    private player_two_score: number = 0;
    private resolver: Function;
    private rejecter: Function;
    private gameOptions: any;

    constructor(gameId: string, socketp1: Socket, socketp2: Socket, private server: Server, options: GameOptions) {
        this.gameId = gameId;
        this.socketP1 = socketp1;
        this.socketP2 = socketp2;
        this.socketP1;
        // this.max_score = 10;
        this.frameUpdateEventName = `${this.gameId}___frame-update`;
        this.MouseMoveEventName = `${this.gameId}___mousemove`;
        this.AskpauseEventName = `${this.gameId}___ask_pause`;
        this.pauseP1 = false;
        this.pauseP2 = false;
        this.gameOptions = options;
        this.setGameParameters(options);
        this.reset();
    }
    setGameParameters(options: GameOptions) {
        if (options.difficulty == "Easy") this.speed_constant = 4;
        else if (options.difficulty == "Medium") this.speed_constant = 6;
        else if (options.difficulty == "Hard") this.speed_constant = 8;
        else this.speed_constant = 6;
    }

    removeSpectator(clientSocketID: string) {
        this.server.in(clientSocketID).socketsLeave(this.gameId);
    }
    async startGame(): Promise<Object> {
        return new Promise((resolve, reject) => {
            this.socketP1.join(this.gameId);
            this.socketP2.join(this.gameId);
            if (this.socketP1.data.username == this.socketP2.data.username) {
                return reject("SAME_PLAYERS_ERROR");
            }
            this.game_paused = true;
            this.resolver = resolve;
            this.rejecter = reject;
            this.server
                .in(this.gameId)
                .timeout(5000)
                .emit(
                    "game-setup-and-init-go-go-power-ranger",
                    {
                        playerOneName: this.socketP1.data.username,
                        playerTwoName: this.socketP2.data.username,
                        gameId: this.gameId,
                        ...this.gameOptions,
                    },
                    async (err) => {
                        if (err) {
                            this.stopGame(true);
                        } else {
                            this.socketP1.once("disconnect", () => {
                                this.stopGame("PLAYER_ONE_DISCONNECTED");
                            });
                            this.socketP2.once("disconnect", () => {
                                this.stopGame("PLAYER_TWO_DISCONNECTED");
                            });
                            this.socketP1.once("quit", () => {
                                this.stopGame("PLAYER_ONE_DISCONNECTED");
                            });
                            this.socketP2.once("quit", () => {
                                this.stopGame("PLAYER_TWO_DISCONNECTED");
                            });
                            this.socketP1.on(this.MouseMoveEventName, (y: number) => {
                                this.player_one_y = y;
                            });
                            this.socketP2.on(this.MouseMoveEventName, (y: number) => {
                                this.player_two_y = y;
                            });
                            this.socketP1.on(this.AskpauseEventName, (name: string) => {
                                if (this.pauseP1 && this.game_paused) {
                                    this.pauseP1 = false;
                                    this.EmitCountdown();
                                } else if (!this.pauseP1 && !this.game_paused) {
                                    this.pauseP1 = true;
                                    this.game_paused = true;
                                    this.pauseGame(this.socketP1.data.username);
                                }
                            });
                            this.socketP2.on(this.AskpauseEventName, (name: string) => {
                                if (this.pauseP2 && this.game_paused) {
                                    this.pauseP2 = false;
                                    this.EmitCountdown();
                                } else if (!this.pauseP2 && !this.game_paused) {
                                    this.pauseP2 = true;
                                    this.game_paused = true;
                                    this.pauseGame(this.socketP2.data.username);
                                }
                            });

                            this.startGameLoop();
                            const coutdown: any = this.countdownGenerator(3, undefined);
                            for await (const iterable of coutdown)
                                this.server.in(this.gameId).emit(`${this.gameId}___countdown`, {
                                    value: iterable.value as string,
                                    status: iterable.status,
                                });

                            this.game_paused = false;
                        }
                    }
                );
        });
    }
    private async EmitCountdown() {
        const coutdown: any = this.countdownGenerator(3, undefined);
        for await (const iterable of coutdown)
            this.server.in(this.gameId).emit(`${this.gameId}___countdown`, {
                value: iterable.value as string,
                name: "",
                status: iterable.status,
            });
        this.game_paused = false;
    }

    private startGameLoop() {
        this.intervalId = setInterval(this.sendFrame.bind(this), 10);
    }

    private sendFrame() {
        if (this.player_one_score >= this.max_score || this.player_two_score >= this.max_score) this.stopGame();
        else this.server.in(this.gameId).volatile.emit(this.frameUpdateEventName, this.getFrame());
    }

    private getFrame() {
        let gamedata = new Uint16Array([this.player_one_y, this.player_two_y, this.ball_x, this.ball_y, this.player_one_score, this.player_two_score]);
        if (!this.game_paused) this.play();
        return {
            gamedata,
        };
    }

    private async *countdownGenerator(seconds: number, callback: Function | undefined | null) {
        yield new Promise((resolve) => resolve({ value: seconds > 0 ? seconds : "", status: "pending", name: "" }));
        while (seconds >= 0) {
            yield new Promise((resolve) => setTimeout(() => resolve({ value: seconds > 0 ? seconds : "Go!", status: "pending", name: "" }), 1000));
            seconds--;
        }
        yield new Promise((resolve) =>
            setTimeout(() => {
                if (callback) callback();
                resolve({ value: seconds > 0 ? seconds : null, status: "done", name: "" });
            }, 1000)
        );
    }
    private async *countdownBreakGenerator(seconds: number, callback: Function | undefined | null) {
        yield new Promise((resolve) => resolve({ value: "", status: "pending", name: "" }));
        while (seconds >= 0) {
            yield new Promise((resolve) => setTimeout(() => resolve({ value: "", status: "pending", name: "" }), 1000));
            seconds--;
        }
        yield new Promise((resolve) =>
            setTimeout(() => {
                if (callback) callback();
                resolve({ value: seconds > 0 ? seconds : null, status: "done", name: "" });
            }, 1000)
        );
    }

    stopGame(error?: any) {
        this.game_paused = true;
        let winnerUsername = null;
        let status = null;
        if (this.socketP1?.connected && this.socketP2?.connected) {
            winnerUsername = this.player_one_score > this.player_two_score ? this.socketP1.data.username : this.socketP2.data.username;
            status = `${winnerUsername} wins`;
        } else status = "game canceled";
        if (this.socketP1?.connected) this.socketP1.removeAllListeners(this.MouseMoveEventName);
        if (this.socketP2?.connected) this.socketP2.removeAllListeners(this.MouseMoveEventName);
        this.server.in(this.gameId).emit(`${this.gameId}___game-end`, { value: status });
        this.server.socketsLeave(this.gameId);
        clearInterval(this.intervalId);
        if (error)
            this.rejecter({
                status: error,
                data: {
                    finishedAt: new Date(),
                    score_playerOne: this.player_one_score,
                    score_playerTwo: this.player_two_score,
                },
            });
        else
            this.resolver({
                finishedAt: new Date(),
                score_playerOne: this.player_one_score,
                score_playerTwo: this.player_two_score,
            });
    }

    private changeDirection(playerPosition: number) {
        let impact_times_ratio = (this.ball_y - playerPosition - this.player_height / 2) * (100 / (this.player_height / 2)) + Math.random() - 0.5;
        this.ball_speed_y = Math.round(impact_times_ratio / 10);
        this.generateBallSpeed();
    }

    private generateBallSpeed() {
        this.ball_speed_x = this.speed_constant;
        let norm = Math.sqrt(this.ball_speed_x * this.ball_speed_x + this.ball_speed_y * this.ball_speed_y);
        this.ball_speed_x /= norm / this.speed_constant;
        this.ball_speed_y /= norm / this.speed_constant;
    }

    private collidep1() {
        if (this.ball_y < this.player_one_y || this.ball_y > this.player_one_y + this.player_height) {
            this.reset();
            this.player_two_score++;
            if (this.player_two_score < this.max_score) this.break();
        } else {
            this.changeDirection(this.player_one_y);
        }
    }

    private collidep2() {
        if (this.ball_y < this.player_two_y || this.ball_y > this.player_two_y + this.player_height) {
            this.reset();
            this.player_one_score++;
            if (this.player_one_score < this.max_score) this.break();
        } else {
            this.changeDirection(this.player_two_y);
            this.ball_speed_x *= -1;
        }
    }
    private ballMove() {
        if (this.ball_y > 720 || this.ball_y < 0) {
            this.ball_speed_y *= -1;
        }

        if (this.ball_x > 1100 - this.player_width) {
            this.collidep2();
        } else if (this.ball_x < this.player_width) {
            this.collidep1();
        }
        if (!this.game_paused) {
            this.ball_x += this.ball_speed_x;
            this.ball_y += this.ball_speed_y;
        }
    }
    private resetScoreUpdate(speedDirection: number) {
        this.ball_x = 550;
        this.ball_y = 360;
        this.ball_speed_x = 7;
        this.ball_speed_y = Math.random() * 3 * speedDirection;
    }

    private reset() {
        this.ball_x = 550;
        this.ball_y = 360;
        this.ball_speed_y = (Math.random() - 0.5) * 2 * this.speed_constant;
        this.generateBallSpeed();
        this.ball_speed_x *= Math.random() < 0.5 ? -1 : 1;
    }
    private play() {
        this.ballMove();
    }
    private async break() {
        if (!this.game_paused) {
            const countdown: any = this.countdownBreakGenerator(0, () => (this.game_paused = true));
            this.game_paused = true;
            for await (const e of countdown) {
                this.server.in(this.gameId).emit(`${this.gameId}___countdown`, {
                    value: e.value as string,
                    name: "",
                    status: e.status,
                });
            }
            this.game_paused = false;
        }
    }
    private async pauseGame(name: string) {
        this.server.in(this.gameId).emit(`${this.gameId}___countdown`, {
            value: `game paused by `,
            name: `${name}`,
            status: "pending",
        });
    }
}
