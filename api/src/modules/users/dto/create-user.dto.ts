import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
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

  @ApiProperty({
    example: 'Admin-sSjRqGa9JH-6#1',
    minLength: 8,
    maxLength: 255,
    description: 'Mật khẩu đăng nhập. BE sẽ tự hash trước khi lưu.'
  })
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password!: string;

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

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'Danh sách ID vai trò gán cho người dùng'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  roleIds?: number[];
}
