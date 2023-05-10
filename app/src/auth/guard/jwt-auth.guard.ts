import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export default class JwtAuthGuard extends AuthGuard("jwt") implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
