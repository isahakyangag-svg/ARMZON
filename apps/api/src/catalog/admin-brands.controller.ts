import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../common/permissions.decorator.js';
import { BrandsService } from './brands.service.js';
import { CreateBrandDto, CreateBrandModelDto, UpdateBrandDto, UpdateBrandModelDto } from './catalog.dto.js';
@ApiTags('Admin brands') @ApiBearerAuth() @Permissions('brands.manage') @Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly brands: BrandsService) {}
  @Post() @ApiOperation({ summary: 'Create a localized brand' }) create(@Body() dto: CreateBrandDto) { return this.brands.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) { return this.brands.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.brands.remove(id); }
  @Post(':id/models') model(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateBrandModelDto) { return this.brands.createModel(id, dto); }
  @Patch(':id/models/:modelId') updateModel(@Param('id', ParseUUIDPipe) id: string, @Param('modelId', ParseUUIDPipe) modelId: string, @Body() dto: UpdateBrandModelDto) { return this.brands.updateModel(id, modelId, dto); }
  @Delete(':id/models/:modelId') removeModel(@Param('id', ParseUUIDPipe) id: string, @Param('modelId', ParseUUIDPipe) modelId: string) { return this.brands.removeModel(id, modelId); }
}
