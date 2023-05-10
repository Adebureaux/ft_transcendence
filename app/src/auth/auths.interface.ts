import { UserWhole } from "src/utils/types/users.types";

export interface IRequestWithUser extends Request {
    fileValidationError: any;
    user: UserWhole;
}

export interface ITokenPayload {
    email: string;
    TwoFA: boolean;
    TwoFAAuthenticated: boolean;
    auth42: boolean;
    auth42Id: string;
}
export interface ITwoFATokenPayload {
    email: string;
    auth42: boolean;
    auth42Id: string;
}
