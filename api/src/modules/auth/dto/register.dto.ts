import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'customer@example.com',
    description: 'Email đăng nhập. Bắt buộc nếu không truyền số điện thoại'
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    example: '0901234567',
    description: 'Số điện thoại đăng nhập. Bắt buộc nếu không truyền email'
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    maxLength: 255,
    description: 'Họ tên hiển thị của người dùng'
  })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 6,
    maxLength: 72,
    description: 'Mật khẩu thô, API sẽ hash trước khi lưu'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
