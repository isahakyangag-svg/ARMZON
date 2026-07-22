import { Body, Controller, Delete, Get, Headers, Ip, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser, RequestMetadata } from '../common/auth.types.js';
import { UpdateProfileDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users') @ApiBearerAuth() @Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}
  private meta(ip: string, userAgent?: string): RequestMetadata { return userAgent ? { ipAddress: ip, userAgent } : { ipAddress: ip }; }
  @Get('me') @ApiOperation({ summary: 'Get own user and profile' }) me(@CurrentUser() user: AuthUser) { return this.users.me(user.id); }
  @Patch('me') @ApiOperation({ summary: 'Update allowed own profile fields' }) update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.users.update(user, dto, this.meta(ip, ua)); }
  @Delete('me') @ApiOperation({ summary: 'Soft-delete own account and revoke sessions' }) remove(@CurrentUser() user: AuthUser, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.users.remove(user, this.meta(ip, ua)); }
}
