import { Body, Controller, Delete, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../common/permissions.decorator.js';
import { AttributesService } from './attributes.service.js';
import { CreateAttributeDto, CreateOptionDto, UpdateAttributeDto, UpdateOptionDto } from './catalog.dto.js';
@ApiTags('Admin attributes') @ApiBearerAuth() @Permissions('attributes.manage') @Controller('admin/attributes')
export class AdminAttributesController {
  constructor(private readonly attributes: AttributesService) {}
  @Post() @ApiOperation({ summary: 'Create a dynamic attribute' }) create(@Body() dto: CreateAttributeDto) { return this.attributes.create(dto); }
  @Patch(':id') update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttributeDto) { return this.attributes.update(id, dto); }
  @Delete(':id') remove(@Param('id', ParseUUIDPipe) id: string) { return this.attributes.remove(id); }
  @Post(':id/options') option(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateOptionDto) { return this.attributes.createOption(id, dto); }
  @Patch(':id/options/:optionId') updateOption(@Param('id', ParseUUIDPipe) id: string, @Param('optionId', ParseUUIDPipe) optionId: string, @Body() dto: UpdateOptionDto) { return this.attributes.updateOption(id, optionId, dto); }
  @Delete(':id/options/:optionId') removeOption(@Param('id', ParseUUIDPipe) id: string, @Param('optionId', ParseUUIDPipe) optionId: string) { return this.attributes.removeOption(id, optionId); }
}
