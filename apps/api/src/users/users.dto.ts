import { IsOptional, IsPhoneNumber, IsString, IsUUID, Length, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ani' }) @IsOptional() @IsString() @Length(1, 80) firstName?: string;
  @ApiPropertyOptional({ example: 'Harutyunyan' }) @IsOptional() @IsString() @Length(1, 80) lastName?: string;
  @ApiPropertyOptional({ example: 'ani_h' }) @IsOptional() @IsString() @Length(3, 32) @Matches(/^[a-zA-Z0-9_]+$/) username?: string;
  @ApiPropertyOptional({ example: '+37499123456' }) @IsOptional() @IsPhoneNumber() phone?: string;
  @ApiPropertyOptional({ example: 'Yerevan' }) @IsOptional() @IsString() @Length(1, 120) city?: string;
  @ApiPropertyOptional({ example: 'Marketplace enthusiast' }) @IsOptional() @IsString() @MaxLength(1000) bio?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() avatarId?: string;
}
