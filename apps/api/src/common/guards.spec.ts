import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { PermissionsGuard } from './permissions.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const context = (user?: object): ExecutionContext => ({ getHandler: () => ({}), getClass: () => class {}, switchToHttp: () => ({ getRequest: () => ({ headers: {}, user }) }) }) as unknown as ExecutionContext;
describe('authorization guards', () => {
  it('roles guard allows a required role', () => { const reflector = { getAllAndOverride: () => ['ADMIN'] } as unknown as Reflector; expect(new RolesGuard(reflector).canActivate(context({ roles: ['ADMIN'] }))).toBe(true); });
  it('roles guard denies a missing role', () => { const reflector = { getAllAndOverride: () => ['OWNER'] } as unknown as Reflector; expect(new RolesGuard(reflector).canActivate(context({ roles: ['USER'] }))).toBe(false); });
  it('permissions guard requires every permission', () => { const reflector = { getAllAndOverride: () => ['users.read', 'audit.read'] } as unknown as Reflector; expect(new PermissionsGuard(reflector).canActivate(context({ permissions: ['users.read'] }))).toBe(false); });
  it('JWT guard rejects requests without a token', async () => { const reflector = { getAllAndOverride: () => false } as unknown as Reflector; const guard = new JwtAuthGuard(reflector, {} as never, {} as never); await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException); });
});
