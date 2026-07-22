import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

type AccessClaims = { sub: string; sid: string; type: 'access' };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: AuthUser }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('Authentication required');
    try {
      const secret = process.env.JWT_ACCESS_SECRET;
      if (!secret) throw new Error('JWT_ACCESS_SECRET is required');
      const claims = await this.jwt.verifyAsync<AccessClaims>(token, { secret });
      if (claims.type !== 'access') throw new Error('Invalid token type');
      const user = await this.prisma.user.findFirst({
        where: { id: claims.sub, deletedAt: null, status: 'ACTIVE', sessions: { some: { id: claims.sid, revokedAt: null, deletedAt: null, expiresAt: { gt: new Date() } } } },
        include: { userRoles: { where: { deletedAt: null }, include: { role: { include: { permissions: { where: { deletedAt: null }, include: { permission: true } } } } } } },
      });
      if (!user) throw new Error('Inactive session');
      request.user = { id: user.id, email: user.email, sessionId: claims.sid, roles: user.userRoles.map((item) => item.role.name), permissions: [...new Set(user.userRoles.flatMap((item) => item.role.permissions.map((entry) => entry.permission.name)))] };
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired access token'); }
  }
}
