import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { RequestMetadata } from '../common/auth.types.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(action: string, actorId: string | null, metadata: RequestMetadata & { details?: Record<string, unknown> } = {}): Promise<void> {
    await this.prisma.auditLog.create({ data: { action, actorId, ipAddress: metadata.ipAddress ?? null, userAgent: metadata.userAgent ?? null, ...(metadata.details ? { metadata: metadata.details as never } : {}) } });
  }
}
