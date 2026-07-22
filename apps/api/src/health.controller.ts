import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@marketplace/types';
import { Public } from './common/public.decorator.js';
@Controller('health')
export class HealthController {
  @Public() @Get()
  check(): HealthResponse { return { status: 'ok', service: 'marketplace-api', timestamp: new Date().toISOString() }; }
}
