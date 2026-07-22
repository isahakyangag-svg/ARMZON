import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { AuthUser, RequestMetadata } from '../common/auth.types.js';
import type { UpdateProfileDto } from './users.dto.js';

const userView = { id: true, email: true, status: true, emailVerifiedAt: true, createdAt: true, updatedAt: true, profile: true } as const;
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  me(userId: string) { return this.prisma.user.findFirstOrThrow({ where: { id: userId, deletedAt: null }, select: userView }); }
  async update(user: AuthUser, dto: UpdateProfileDto, meta: RequestMetadata) {
    const profile = await this.prisma.profile.upsert({ where: { userId: user.id }, create: { userId: user.id, ...dto }, update: dto });
    await this.audit.record('profile.updated', user.id, { ...meta, details: { fields: Object.keys(dto) } }); return profile;
  }
  async remove(user: AuthUser, meta: RequestMetadata): Promise<{ message: string }> {
    const now = new Date();
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: user.id }, data: { deletedAt: now, status: 'DELETED', normalizedEmail: `deleted:${user.id}:${user.email}` } }), this.prisma.profile.updateMany({ where: { userId: user.id }, data: { deletedAt: now } }), this.prisma.userSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: now } })]);
    await this.audit.record('profile.deleted', user.id, meta); return { message: 'Account deleted' };
  }
}
