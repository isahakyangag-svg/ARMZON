import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/public.decorator.js';
import { BrandsService } from './brands.service.js';
@Public() @ApiTags('Brands') @Controller('brands')
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}
  @Get() @ApiOperation({ summary: 'List active brands' }) list(@Query('locale') locale?: string) { return this.brands.list(locale); }
  @Get(':id/models') @ApiOperation({ summary: 'List active models for a brand' }) models(@Param('id', ParseUUIDPipe) id: string) { return this.brands.models(id); }
  @Get(':id') @ApiOperation({ summary: 'Get brand by UUID' }) one(@Param('id', ParseUUIDPipe) id: string) { return this.brands.one(id); }
}
