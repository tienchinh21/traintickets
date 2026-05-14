import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerateRouteCodeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga đầu tuyến'
  })
  @IsUUID()
  fromStationId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga cuối tuyến'
  })
  @IsUUID()
  toStationId!: string;
}
