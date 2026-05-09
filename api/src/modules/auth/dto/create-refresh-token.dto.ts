import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty({
    example: '1',
    description: 'ID user sở hữu refresh token'
  })
  @IsString()
  userId!: string;

  @ApiProperty({
    example: 'sha256-refresh-token-hash',
    minLength: 32,
    maxLength: 255,
    description: 'Hash của refresh token, không lưu token thô'
  })
  @IsString()
  @MinLength(32)
  @MaxLength(255)
  tokenHash!: string;

  @ApiPropertyOptional({
    example: 'Chrome on macOS',
    maxLength: 255,
    description: 'Tên thiết bị hoặc trình duyệt'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;

  @ApiPropertyOptional({
    example: '127.0.0.1',
    maxLength: 45,
    description: 'Địa chỉ IP đăng nhập'
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0',
    maxLength: 1000,
    description: 'User-Agent của client'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userAgent?: string;

  @ApiProperty({
    example: '2026-06-08T00:00:00.000Z',
    description: 'Thời điểm refresh token hết hạn'
  })
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}
