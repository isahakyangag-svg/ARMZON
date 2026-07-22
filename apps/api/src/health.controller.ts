import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@marketplace/types';
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse { return { status: 'ok', service: 'marketplace-api', timestamp: new Date().toISOString() }; }
}
