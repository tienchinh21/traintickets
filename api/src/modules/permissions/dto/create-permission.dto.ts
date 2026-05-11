import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'STATIONS_CREATE',
    maxLength: 100,
    pattern: '^[A-Z0-9_:.]+$',
    description: 'Mã quyền duy nhất dùng trong code và seed'
  })
  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Z0-9_:.]+$/)
  code!: string;

  @ApiProperty({
    example: 'Tạo ga',
    maxLength: 150,
    description: 'Tên hiển thị của quyền'
  })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    example: 'Cho phép tạo ga tàu mới trong CMS',
    maxLength: 500,
    description: 'Mô tả quyền'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'stations',
    maxLength: 100,
    description: 'Module hoặc nhóm chức năng sở hữu quyền'
  })
  @IsString()
  @MaxLength(100)
  module!: string;

  @ApiProperty({
    example: 'create',
    maxLength: 50,
    description: 'Hành động nghiệp vụ của quyền'
  })
  @IsString()
  @MaxLength(50)
  action!: string;

  @ApiProperty({
    example: 'POST',
    maxLength: 10,
    description: 'HTTP method bắt buộc để guard check quyền theo route runtime'
  })
  @IsString()
  @MaxLength(10)
  method!: string;

  @ApiProperty({
    example: '/stations',
    maxLength: 255,
    description:
      'Path route bắt buộc để guard check quyền runtime, dùng format của controller như /roles/:id'
  })
  @IsString()
  @MaxLength(255)
  path!: string;

  @ApiProperty({
    enum: PermissionStatus,
    example: PermissionStatus.ACTIVE,
    description: 'Trạng thái quyền'
  })
  @IsEnum(PermissionStatus)
  status: PermissionStatus = PermissionStatus.ACTIVE;
}
