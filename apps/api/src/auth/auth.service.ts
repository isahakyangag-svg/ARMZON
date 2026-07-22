import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthUser, RequestMetadata } from '../common/auth.types.js';
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto.js';

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
const requiredEnv = (name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET'): string => { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; };
const publicUserSelect = { id: true, email: true, status: true, emailVerifiedAt: true, createdAt: true, updatedAt: true, profile: true } as const;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly mail: MailService, private readonly audit: AuditService) {}

  async register(dto: RegisterDto, meta: RequestMetadata) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findFirst({ where: { normalizedEmail, deletedAt: null } })) throw new ConflictException('An account with this email already exists');
    const userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) throw new Error('USER role is not seeded');
    const user = await this.prisma.user.create({ data: { email: normalizedEmail, normalizedEmail, passwordHash: await argon2.hash(dto.password), profile: { create: { firstName: dto.firstName, lastName: dto.lastName } }, userRoles: { create: { roleId: userRole.id } } }, select: publicUserSelect });
    const token = await this.createVerificationToken(user.id);
    await this.mail.sendEmailVerification(user.email, token);
    await this.audit.record('auth.register', user.id, meta);
    return { user, message: 'Registration successful. Check your email to verify the account.' };
  }

  async login(dto: LoginDto, meta: RequestMetadata) {
    const user = await this.prisma.user.findFirst({ where: { normalizedEmail: dto.email.trim().toLowerCase(), deletedAt: null } });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) { await this.audit.record('auth.login_failed', user?.id ?? null, meta); throw new UnauthorizedException('Invalid email or password'); }
    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED' || user.status === 'DELETED') throw new UnauthorizedException('Account is unavailable');
    const tokens = await this.createSession(user.id, meta);
    await this.audit.record('auth.login', user.id, meta);
    return tokens;
  }

  async refresh(rawToken: string, meta: RequestMetadata) {
    let claims: { sub: string; sid: string; type: string };
    try { claims = await this.jwt.verifyAsync(rawToken, { secret: requiredEnv('JWT_REFRESH_SECRET') }); } catch { throw new UnauthorizedException('Invalid or expired refresh token'); }
    if (claims.type !== 'refresh') throw new UnauthorizedException('Invalid or expired refresh token');
    const session = await this.prisma.userSession.findFirst({ where: { id: claims.sid, userId: claims.sub, revokedAt: null, deletedAt: null, expiresAt: { gt: new Date() } } });
    if (!session || !(await argon2.verify(session.refreshTokenHash, rawToken))) throw new UnauthorizedException('Invalid or expired refresh token');
    return this.rotateSession(session.id, session.userId, meta);
  }

  async logout(user: AuthUser, meta: RequestMetadata): Promise<{ message: string }> {
    await this.prisma.userSession.updateMany({ where: { id: user.sessionId, userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.record('auth.logout', user.id, meta); return { message: 'Logged out' };
  }
  async logoutAll(user: AuthUser, meta: RequestMetadata): Promise<{ message: string }> {
    await this.prisma.userSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.record('auth.logout_all', user.id, meta); return { message: 'Logged out from all devices' };
  }
  async me(user: AuthUser) { return this.prisma.user.findFirstOrThrow({ where: { id: user.id, deletedAt: null }, select: publicUserSelect }); }

  async forgotPassword(dto: ForgotPasswordDto, meta: RequestMetadata): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { normalizedEmail: dto.email.trim().toLowerCase(), deletedAt: null } });
    if (user) { const token = randomBytes(32).toString('base64url'); await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: this.expiresInMinutes(Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 30)) } }); await this.mail.sendPasswordReset(user.email, token); await this.audit.record('auth.password_reset_requested', user.id, meta); }
    return { message: 'If the account exists, password reset instructions have been sent.' };
  }
  async resetPassword(dto: ResetPasswordDto, meta: RequestMetadata): Promise<{ message: string }> {
    const record = await this.prisma.passwordResetToken.findFirst({ where: { tokenHash: hashToken(dto.token), usedAt: null, deletedAt: null, expiresAt: { gt: new Date() } } });
    if (!record) throw new BadRequestException('Invalid or expired reset token');
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await argon2.hash(dto.password) } }), this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }), this.prisma.userSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } })]);
    await this.audit.record('auth.password_reset', record.userId, meta); return { message: 'Password has been reset' };
  }
  async verifyEmail(rawToken: string, meta: RequestMetadata): Promise<{ message: string }> {
    const record = await this.prisma.emailVerificationToken.findFirst({ where: { tokenHash: hashToken(rawToken), usedAt: null, deletedAt: null, expiresAt: { gt: new Date() } } });
    if (!record) throw new BadRequestException('Invalid or expired verification token');
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date(), status: 'ACTIVE' } }), this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })]);
    await this.audit.record('auth.email_verified', record.userId, meta); return { message: 'Email verified' };
  }

  private async createVerificationToken(userId: string): Promise<string> { const token = randomBytes(32).toString('base64url'); await this.prisma.emailVerificationToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt: this.expiresInMinutes(Number(process.env.EMAIL_TOKEN_TTL_MINUTES ?? 1440)) } }); return token; }
  private async createSession(userId: string, meta: RequestMetadata) { const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30) * 86_400_000); const session = await this.prisma.userSession.create({ data: { userId, refreshTokenHash: 'pending', expiresAt, ipAddress: meta.ipAddress ?? null, userAgent: meta.userAgent ?? null } }); return this.issueAndStoreTokens(userId, session.id); }
  private async rotateSession(sessionId: string, userId: string, meta: RequestMetadata) { await this.prisma.userSession.update({ where: { id: sessionId }, data: { revokedAt: new Date() } }); return this.createSession(userId, meta); }
  private async issueAndStoreTokens(userId: string, sessionId: string) { const accessToken = await this.jwt.signAsync({ sub: userId, sid: sessionId, type: 'access' }, { secret: requiredEnv('JWT_ACCESS_SECRET'), expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as never }); const refreshToken = await this.jwt.signAsync({ sub: userId, sid: sessionId, type: 'refresh' }, { secret: requiredEnv('JWT_REFRESH_SECRET'), expiresIn: `${Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 30)}d` }); await this.prisma.userSession.update({ where: { id: sessionId }, data: { refreshTokenHash: await argon2.hash(refreshToken) } }); return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: process.env.JWT_ACCESS_TTL ?? '15m' }; }
  private expiresInMinutes(minutes: number): Date { return new Date(Date.now() + minutes * 60_000); }
}
