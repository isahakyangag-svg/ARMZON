import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Length, Matches, MaxLength, Min, ValidateNested } from 'class-validator';
import { AttributeType } from '../generated/prisma/enums.js';

export class TranslationDto {
  @ApiProperty({ enum: ['ru', 'en', 'hy'], example: 'ru' }) @IsEnum(['ru', 'en', 'hy']) locale!: string;
  @ApiProperty({ example: 'Автомобили' }) @IsString() @Length(1, 160) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) seoDescription?: string;
}
export class LabelTranslationDto {
  @ApiProperty({ enum: ['ru', 'en', 'hy'] }) @IsEnum(['ru', 'en', 'hy']) locale!: string;
  @ApiProperty() @IsString() @Length(1, 160) label!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) unit?: string;
}
export class CreateCategoryDto {
  @ApiProperty({ example: 'cars' }) @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) icon?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() imageId?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresModeration?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) listingLifetimeDays?: number;
  @ApiProperty({ type: [TranslationDto] }) @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => TranslationDto) translations!: TranslationDto[];
}
export class UpdateCategoryDto extends CreateCategoryDto {
  @IsOptional() declare slug: string;
  @IsOptional() declare translations: TranslationDto[];
}
export class DeleteCategoryDto { @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() force?: boolean; }
export class ReorderItemDto { @IsUUID() id!: string; @IsInt() @Min(0) sortOrder!: number; @IsOptional() @IsUUID() parentId?: string; }
export class ReorderCategoriesDto { @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ReorderItemDto) items!: ReorderItemDto[]; }
export class AttachAttributeDto { @IsUUID() attributeId!: string; @IsOptional() @IsBoolean() required?: boolean; @IsOptional() @IsInt() @Min(0) sortOrder?: number; }

export class CreateAttributeDto {
  @ApiProperty({ example: 'mileage' }) @IsString() @Matches(/^[a-z][a-zA-Z0-9]*$/) key!: string;
  @ApiProperty({ enum: AttributeType }) @IsEnum(AttributeType) type!: AttributeType;
  @IsOptional() @IsBoolean() required?: boolean; @IsOptional() @IsBoolean() filterable?: boolean; @IsOptional() @IsBoolean() searchable?: boolean;
  @IsOptional() @IsBoolean() showInCard?: boolean; @IsOptional() @IsBoolean() showInDetails?: boolean; @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number; @IsOptional() @IsNumber() minValue?: number; @IsOptional() @IsNumber() maxValue?: number;
  @IsOptional() @IsInt() @Min(0) minLength?: number; @IsOptional() @IsInt() @Min(1) maxLength?: number; @IsOptional() @IsString() regex?: string;
  @IsOptional() @IsObject() defaultValue?: Record<string, unknown>; @IsOptional() @IsUUID() dependsOnAttributeId?: string;
  @ApiProperty({ type: [LabelTranslationDto] }) @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => LabelTranslationDto) translations!: LabelTranslationDto[];
}
export class UpdateAttributeDto extends CreateAttributeDto { @IsOptional() declare key: string; @IsOptional() declare type: AttributeType; @IsOptional() declare translations: LabelTranslationDto[]; }
export class CreateOptionDto { @IsString() @Length(1, 100) value!: string; @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/) colorHex?: string; @IsOptional() @IsInt() @Min(0) sortOrder?: number; @IsOptional() @IsBoolean() isActive?: boolean; @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => LabelTranslationDto) translations!: LabelTranslationDto[]; }
export class UpdateOptionDto extends CreateOptionDto { @IsOptional() declare value: string; @IsOptional() declare translations: LabelTranslationDto[]; }

export class BrandTranslationDto { @IsEnum(['ru', 'en', 'hy']) locale!: string; @IsString() @Length(1, 160) name!: string; }
export class CreateBrandDto { @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string; @IsOptional() @IsUUID() logoId?: string; @IsOptional() @IsInt() @Min(0) sortOrder?: number; @IsOptional() @IsBoolean() isActive?: boolean; @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BrandTranslationDto) translations!: BrandTranslationDto[]; @IsOptional() @IsArray() @IsUUID('4', { each: true }) categoryIds?: string[]; }
export class UpdateBrandDto extends CreateBrandDto { @IsOptional() declare slug: string; @IsOptional() declare translations: BrandTranslationDto[]; }
export class CreateBrandModelDto { @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string; @IsOptional() @IsInt() @Min(0) sortOrder?: number; @IsOptional() @IsBoolean() isActive?: boolean; @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => BrandTranslationDto) translations!: BrandTranslationDto[]; }
export class UpdateBrandModelDto extends CreateBrandModelDto { @IsOptional() declare slug: string; @IsOptional() declare translations: BrandTranslationDto[]; }
