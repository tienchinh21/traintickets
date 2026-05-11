import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({
    example: 'admin',
    description: 'Tìm theo họ tên, email hoặc số điện thoại'
  })
  @IsOptional()
  @IsString()
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
