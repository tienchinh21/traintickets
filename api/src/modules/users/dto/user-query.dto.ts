import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Trang hiện tại'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    type: Number,
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    description: 'Số bản ghi mỗi trang'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'Tìm theo họ tên, email hoặc số điện thoại'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.STAFF,
    description: 'Lọc theo loại người dùng'
  })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Lọc theo trạng thái tài khoản'
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
