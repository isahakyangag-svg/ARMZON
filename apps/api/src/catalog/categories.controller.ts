import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/public.decorator.js';
import { CategoriesService } from './categories.service.js';
@Public() @ApiTags('Categories') @Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Get() @ApiOperation({ summary: 'List active categories' }) list(@Query('locale') locale?: string) { return this.categories.list(locale); }
  @Get('tree') @ApiOperation({ summary: 'Get the complete category tree' }) tree(@Query('locale') locale?: string) { return this.categories.tree(locale); }
  @Get('slug/:slug') @ApiOperation({ summary: 'Get category by slug' }) slug(@Param('slug') slug: string) { return this.categories.bySlug(slug); }
  @Get(':id/children') children(@Param('id', ParseUUIDPipe) id: string) { return this.categories.children(id); }
  @Get(':id/attributes') attributes(@Param('id', ParseUUIDPipe) id: string) { return this.categories.attributes(id); }
  @Get(':id/brands') brands(@Param('id', ParseUUIDPipe) id: string) { return this.categories.brands(id); }
  @Get(':id') @ApiOperation({ summary: 'Get category by UUID' }) one(@Param('id', ParseUUIDPipe) id: string) { return this.categories.byId(id); }
}
