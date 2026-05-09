import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    example: 'refresh-token-tu-api-login',
    minLength: 32,
    description: 'Refresh token cần thu hồi'
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
