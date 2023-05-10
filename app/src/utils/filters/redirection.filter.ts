import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, PayloadTooLargeException } from "@nestjs/common";
import { HttpArgumentsHost } from "@nestjs/common/interfaces";
import { Response } from "express";
import { clearCookies } from "../helpers/clearCookies";

@Catch(UnauthorizedException)
export class AuthErrorFilter implements ExceptionFilter<UnauthorizedException> {
    constructor() {}
    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const status: number = exception.getStatus();
        if (status === 401 && (request.url === "/api/auth/refresh" || request.url === "/api/auth/logout")) {
            clearCookies(response);
            response.clearCookie("Authentication");
            response.clearCookie("has_access");
            response.clearCookie("Refresh");
            response.clearCookie("has_refresh");
            response.clearCookie("WsAuth");
        }
        return response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
@Catch(PayloadTooLargeException)
export class TooLargeFilter implements ExceptionFilter<PayloadTooLargeException> {
    constructor() {}
    catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
        const ctx: HttpArgumentsHost = host.switchToHttp();
        const response: Response = ctx.getResponse<Response>();
        const request: Request = ctx.getRequest<Request>();
        const status: number = exception.getStatus();
        return response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: ["Payload Too Large"],
        });
    }
}
