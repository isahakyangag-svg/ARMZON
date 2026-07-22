import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const normalizeEmail = ({ value }: { value: unknown }): unknown => typeof value === 'string' ? value.trim().toLowerCase() : value;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' }) @Transform(normalizeEmail) @IsEmail() email!: string;
  @ApiProperty({ example: 'StrongPassword123!' }) @IsString() @MinLength(12) @Matches(passwordPattern, { message: 'password must contain upper-case, lower-case and numeric characters' }) password!: string;
  @ApiProperty({ example: 'StrongPassword123!' }) @IsString() @ValidateIf((dto: RegisterDto) => dto.password !== dto.passwordConfirmation) @Matches(/^$/, { message: 'passwordConfirmation must match password' }) passwordConfirmation!: string;
  @ApiProperty({ example: 'Ani' }) @IsString() @Length(1, 80) firstName!: string;
  @ApiProperty({ example: 'Harutyunyan' }) @IsString() @Length(1, 80) lastName!: string;
}
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' }) @Transform(normalizeEmail) @IsEmail() email!: string;
  @ApiProperty({ example: 'StrongPassword123!' }) @IsString() password!: string;
}
export class RefreshDto { @ApiProperty() @IsString() @MinLength(32) refreshToken!: string; }
export class ForgotPasswordDto { @ApiProperty({ example: 'user@example.com' }) @Transform(normalizeEmail) @IsEmail() email!: string; }
export class TokenDto { @ApiProperty() @IsString() @MinLength(32) token!: string; }
export class ResetPasswordDto extends TokenDto {
  @ApiProperty({ example: 'NewStrongPassword123!' }) @IsString() @MinLength(12) @Matches(passwordPattern) password!: string;
  @ApiProperty({ example: 'NewStrongPassword123!' }) @IsString() @ValidateIf((dto: ResetPasswordDto) => dto.password !== dto.passwordConfirmation) @Matches(/^$/, { message: 'passwordConfirmation must match password' }) passwordConfirmation!: string;
}
