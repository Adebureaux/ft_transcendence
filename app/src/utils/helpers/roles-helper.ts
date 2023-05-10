import { ForbiddenException } from "@nestjs/common";
import { Role } from "@prisma/client";

export function filterInferiorRole(role: Role, target: Role | null | undefined = null) {
    if (target === null || target === Role.USER) return true;
    else if (target === Role.OWNER) {
        if (role !== Role.OWNER) throw new ForbiddenException(["You are not authorized to modify this channel"]);
    } else if (target === Role.ADMIN) {
        if (role === Role.USER) throw new ForbiddenException(["You are not authorized to modify this channel"]);
    }
    return true;
}
export function throwIfRoleIsInferiorOrEqualToTarget(initiator_role: Role = Role.USER, target_role: Role = Role.OWNER) {
    if (target_role === Role.OWNER) {
        throw new ForbiddenException(["Unauthorized action, you can't alter an OWNER"]);
    } else if (target_role === Role.ADMIN && initiator_role !== Role.OWNER) {
        throw new ForbiddenException(["Unauthorized action, you can't alter an ADMIN"]);
    } else if (target_role === Role.USER && initiator_role === Role.USER) {
        throw new ForbiddenException(["Unauthorized action, you can't alter a USER"]);
    }
}
