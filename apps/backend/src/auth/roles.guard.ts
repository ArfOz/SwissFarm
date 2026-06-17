import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ADMIN_ONLY_KEY = 'adminOnly';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const adminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If endpoint is not admin-only, allow access
    if (!adminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // JwtStrategy validates and attaches user to request
    if (!user) {
      return false;
    }

    return user.role === 'admin';
  }
}