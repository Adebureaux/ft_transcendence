import { Response } from "express";

export function clearCookies(response: Response): void {
    response.clearCookie("Authentication");
    response.clearCookie("has_access");
    response.clearCookie("Refresh");
    response.clearCookie("has_refresh");
    response.clearCookie("WsAuth");
}
