import { Body, Controller, Delete, Param, ParseBoolPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../common/permissions.decorator.js';
import { AttachAttributeDto, CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './catalog.dto.js';
import { CategoriesService } from './categories.service.js';
@ApiTags('Admin categories') @ApiBearerAuth() @Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Post() @Permissions('categories.create') @ApiOperation({ summary: 'Create a localized category' }) create(@Body() dto: CreateCategoryDto) { return this.categories.create(dto); }
  @Patch(':id') @Permissions('categories.update') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) { return this.categories.update(id, dto); }
  @Delete(':id') @Permissions('categories.delete') remove(@Param('id', ParseUUIDPipe) id: string, @Query('force', new ParseBoolPipe({ optional: true })) force?: boolean) { return this.categories.remove(id, force); }
  @Post(':id/restore') @Permissions('categories.update') restore(@Param('id', ParseUUIDPipe) id: string) { return this.categories.restore(id); }
  @Post('reorder') @Permissions('categories.update') reorder(@Body() dto: ReorderCategoriesDto) { return this.categories.reorder(dto); }
  @Post(':id/attributes') @Permissions('attributes.manage') attach(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AttachAttributeDto) { return this.categories.attachAttribute(id, dto); }
  @Delete(':id/attributes/:attributeId') @Permissions('attributes.manage') detach(@Param('id', ParseUUIDPipe) id: string, @Param('attributeId', ParseUUIDPipe) attributeId: string) { return this.categories.detachAttribute(id, attributeId); }
}
