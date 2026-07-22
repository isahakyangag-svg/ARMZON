export type AuthUser = { id: string; email: string; roles: string[]; permissions: string[]; sessionId: string };
export type RequestMetadata = { ipAddress?: string; userAgent?: string };
