import { User } from "@prisma/client";

export interface IRequestWithUser extends Request {
  user: User;
}

export interface ITokenPayload {
  username: string;
}
