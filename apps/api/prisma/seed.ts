import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PERMISSION_NAMES, ROLE_NAMES } from './rbac.constants.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
async function seed(): Promise<void> {
  const permissions = new Map<string, string>();
  for (const name of PERMISSION_NAMES) { const permission = await prisma.permission.upsert({ where: { name }, update: { deletedAt: null }, create: { name } }); permissions.set(name, permission.id); }
  for (const name of ROLE_NAMES) {
    const role = await prisma.role.upsert({ where: { name }, update: { deletedAt: null }, create: { name } });
    const granted = name === 'OWNER' || name === 'ADMIN' ? PERMISSION_NAMES : name === 'MODERATOR' ? ['users.read', 'users.update', 'users.block', 'audit.read'] : name === 'SUPPORT' ? ['users.read', 'users.update'] : [];
    for (const permissionName of granted) { const permissionId = permissions.get(permissionName); if (!permissionId) throw new Error(`Missing permission: ${permissionName}`); await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId } }, update: { deletedAt: null }, create: { roleId: role.id, permissionId } }); }
  }
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase(); const password = process.env.OWNER_PASSWORD;
  if (!email || !password) { console.warn('OWNER_EMAIL/OWNER_PASSWORD not set; development OWNER was not created'); return; }
  const ownerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'OWNER' } });
  const owner = await prisma.user.upsert({ where: { normalizedEmail: email }, update: { email, deletedAt: null, status: 'ACTIVE', emailVerifiedAt: new Date() }, create: { email, normalizedEmail: email, passwordHash: await argon2.hash(password), status: 'ACTIVE', emailVerifiedAt: new Date(), profile: { create: { firstName: process.env.OWNER_FIRST_NAME ?? 'Development', lastName: process.env.OWNER_LAST_NAME ?? 'Owner' } } } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: owner.id, roleId: ownerRole.id } }, update: { deletedAt: null }, create: { userId: owner.id, roleId: ownerRole.id } });
}

seed().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
