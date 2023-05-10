import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ITokenPayload } from "../auths.interface";
import * as dotenv from "dotenv";
import { AuthService } from "../auth.service";
import { UserWhole } from "src/utils/types/users.types";
import { WsService } from "src/ws/ws.service";
import { PrismaService } from "src/prisma.service";
dotenv.config();

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(private readonly authService: AuthService, private readonly wsService: WsService, private readonly prismaService: PrismaService) {
        super({
            secretOrKey: `${process.env.JWT_REFRESH_SECRET}`,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.Refresh;
                },
            ]),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: ITokenPayload): Promise<UserWhole> {
        const refreshToken = request.cookies.Refresh;
        const user = await this.prismaService.getWholeUserByEmail(payload.email).catch((e) => {
            throw new UnauthorizedException(e.message);
        });
        if (refreshToken && user?.refresh_token && user?.refresh_token === refreshToken) {
            if (!user.TwoFA) return user;
            else if (user.TwoFA && payload.TwoFAAuthenticated) return user;
            else throw new UnauthorizedException(["2FA is enabled"]);
        }
        throw new UnauthorizedException(["invalid token"]);
    }
}
