import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-token-tu-api-login',
    minLength: 32,
    description: 'Refresh token còn hiệu lực để cấp cặp token mới'
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
