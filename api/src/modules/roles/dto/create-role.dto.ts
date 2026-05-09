import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'OPERATOR',
    maxLength: 50,
    pattern: '^[A-Z0-9_]+$',
    description: 'Mã vai trò duy nhất, viết hoa, không dấu, không khoảng trắng'
  })
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/)
  code!: string;

  @ApiProperty({
    example: 'Nhân viên vận hành',
    maxLength: 100,
    description: 'Tên hiển thị của vai trò'
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Có quyền quản lý dữ liệu vận hành cơ bản',
    maxLength: 500,
    description: 'Mô tả vai trò'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: RoleStatus,
    example: RoleStatus.ACTIVE,
    description: 'Trạng thái vai trò'
  })
  @IsEnum(RoleStatus)
  status: RoleStatus = RoleStatus.ACTIVE;
}
