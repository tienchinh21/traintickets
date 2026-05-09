import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@traintickets.local',
    description: 'Email hoặc số điện thoại dùng để đăng nhập'
  })
  @IsString()
  identifier!: string;

  @ApiProperty({
    example: 'Admin-sSjRqGa9JH-6#1',
    minLength: 6,
    description: 'Mật khẩu tài khoản'
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
