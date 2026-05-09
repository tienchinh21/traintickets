import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Email đăng nhập hoặc nhận vé'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '0901234567',
    maxLength: 30,
    description: 'Số điện thoại đăng nhập hoặc nhận thông báo'
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    example: '$2b$12$...',
    maxLength: 255,
    description: 'Hash mật khẩu, không phải mật khẩu thô'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  passwordHash?: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    maxLength: 255,
    description: 'Họ tên hiển thị'
  })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.CUSTOMER,
    description: 'Loại người dùng'
  })
  @IsEnum(UserType)
  userType: UserType = UserType.CUSTOMER;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Trạng thái tài khoản'
  })
  @IsEnum(UserStatus)
  status: UserStatus = UserStatus.ACTIVE;
}
