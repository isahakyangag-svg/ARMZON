import { Body, Controller, Get, Headers, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/current-user.decorator.js';
import { Public } from '../common/public.decorator.js';
import type { AuthUser, RequestMetadata } from '../common/auth.types.js';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto, LoginDto, RefreshDto, RegisterDto, ResetPasswordDto, TokenDto } from './auth.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  private meta(ip: string, userAgent?: string): RequestMetadata { return userAgent ? { ipAddress: ip, userAgent } : { ipAddress: ip }; }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post('register')
  @ApiOperation({ summary: 'Register a user and send email verification' }) @ApiResponse({ status: 201, description: 'User registered' }) @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() dto: RegisterDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.register(dto, this.meta(ip, ua)); }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post('login')
  @ApiOperation({ summary: 'Authenticate and create a session' }) @ApiResponse({ status: 201, description: 'Access and refresh tokens' }) @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.login(dto, this.meta(ip, ua)); }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post('refresh')
  @ApiOperation({ summary: 'Rotate a refresh token' }) refresh(@Body() dto: RefreshDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.refresh(dto.refreshToken, this.meta(ip, ua)); }

  @ApiBearerAuth() @Post('logout') @ApiOperation({ summary: 'Revoke the current session' })
  logout(@CurrentUser() user: AuthUser, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.logout(user, this.meta(ip, ua)); }

  @ApiBearerAuth() @Post('logout-all') @ApiOperation({ summary: 'Revoke all user sessions' })
  logoutAll(@CurrentUser() user: AuthUser, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.logoutAll(user, this.meta(ip, ua)); }

  @Public() @Throttle({ default: { limit: 3, ttl: 60_000 } }) @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset without account enumeration' })
  forgot(@Body() dto: ForgotPasswordDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.forgotPassword(dto, this.meta(ip, ua)); }

  @Public() @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using a one-time token' })
  reset(@Body() dto: ResetPasswordDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.resetPassword(dto, this.meta(ip, ua)); }

  @Public() @Post('verify-email') @ApiOperation({ summary: 'Verify email using a one-time token' })
  verify(@Body() dto: TokenDto, @Ip() ip: string, @Headers('user-agent') ua?: string) { return this.auth.verifyEmail(dto.token, this.meta(ip, ua)); }

  @ApiBearerAuth() @Get('me') @ApiOperation({ summary: 'Get the authenticated user' }) @ApiResponse({ status: 401, description: 'Authentication required' })
  me(@CurrentUser() user: AuthUser) { return this.auth.me(user); }
}
