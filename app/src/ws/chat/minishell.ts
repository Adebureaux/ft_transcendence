#!/usr/bin/env ts-node
import * as ch from "chevrotain";

const Username = ch.createToken({ name: "Username", pattern: /[a-zA-Z0-9]+/ });
const Duration = ch.createToken({ name: "Duration", pattern: /[0-9]+/ });
const BanCmd = ch.createToken({ name: "ban", pattern: /\/ban/ });
const MuteCmd = ch.createToken({ name: "mute", pattern: /\/mute/ });
const KickCmd = ch.createToken({ name: "kick", pattern: /\/kick/ });
const PromoteCmd = ch.createToken({ name: "promote", pattern: /\/promote/ });
const PardonCmd = ch.createToken({ name: "pardon", pattern: /\/pardon/ });
const DemoteCmd = ch.createToken({ name: "demote", pattern: /\/demote/ });
const WhiteSpace = ch.createToken({ name: "WhiteSpace", pattern: /\s+/, group: ch.Lexer.SKIPPED });

const helperMesage = [
    { command: "ban", message: "/ban <username> <duration>" },
    { command: "mute", message: "/mute <username> <duration>" },
    { command: "kick", message: "/kick <username> " },
    { command: "promote", message: "/promote <username> " },
    { command: "pardon", message: "/pardon <username> " },
    { command: "demote", message: "/demote <username> " },
];

function throwHelperMessage(cmd: string) {
    const message = helperMesage.find((e: any) => {
        return e.command === cmd;
    });
    if (message) throw new Error(message.message);
    throw new Error("command not found: " + cmd);
}

const allTokens = [WhiteSpace, Duration, Username, BanCmd, MuteCmd, KickCmd, PromoteCmd, PardonCmd, DemoteCmd];

const ChatLexer = new ch.Lexer(allTokens);

export interface ICommand {
    status: "OK" | "ERROR";
    message_status: string;
    name: string;
    username: string;
    duration?: number;
}

export function parseCommand(text: string): ICommand {
    const ret: ICommand = {
        status: "ERROR",
        message_status: "",
        name: "",
        username: "",
        duration: 0,
    };
    const tokens: ch.ILexingResult = ChatLexer.tokenize(text);
    let pos = 0;
    let commandPos = tokens.tokens[0];
    const consume = (tokenType: ch.TokenType[]) => {
        const token: ch.IToken = tokens.tokens[pos];
        if (!token) {
            throw "";
        }
        const foundTokenType = tokenType.find((e: any) => {
            return token.tokenType === e;
        });
        if (!foundTokenType) {
            throw "";
        }
        pos++;
        return token;
    };
    try {
        let commandName = null;
        try {
            commandName = consume([BanCmd, MuteCmd, KickCmd, PromoteCmd, DemoteCmd, PardonCmd] as ch.TokenType[]).image.slice(1);
        } catch (err: any) {
            if (tokens?.tokens[0]?.image) throwHelperMessage(tokens.tokens[0].image);
            throw new Error("command error");
        }
        ret.name = commandName;
        let durationToken = null;
        switch (commandName) {
            case "ban":
            case "mute":
                try {
                    ret.username = consume([Username]).image;
                } catch (e: any) {
                    throwHelperMessage(commandName);
                }
                if (ret.username.length === 0) {
                    throw new Error("Username cannot be empty");
                }

                try {
                    durationToken = consume([Duration]);
                } catch (e: any) {
                    throwHelperMessage(commandName);
                }
                ret.duration = parseInt(durationToken.image);
                if (ret.duration <= 0) {
                    throw new Error("Duration must be greater than zero");
                }
                if (ret.duration > 9999) {
                    throw new Error("Duration must be inferior to 10000 minutes");
                }
                break;
            case "pardon":
            case "kick":
            case "promote":
            case "demote":
                try {
                    ret.username = consume([Username]).image;
                } catch (e: any) {
                    throwHelperMessage(commandName);
                }
                break;
            default:
                throw new Error(`Unknown command: ${commandName}`);
        }
    } catch (err: any) {
        ret.message_status = err.message;
        return ret as ICommand;
    }
    ret.status = "OK";
    return ret as ICommand;
}
