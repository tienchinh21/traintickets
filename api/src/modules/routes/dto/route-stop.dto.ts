import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class RouteStopDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga dừng trên tuyến'
  })
  @IsUUID()
  stationId!: string;

  @ApiProperty({
    type: Number,
    example: 1,
    minimum: 1,
    description: 'Thứ tự ga dừng trên tuyến, bắt đầu từ 1'
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stopOrder!: number;

  @ApiProperty({
    type: Number,
    example: 0,
    minimum: 0,
    description: 'Khoảng cách từ ga đầu tuyến đến ga này, đơn vị km'
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distanceFromStartKm!: number;

  @ApiPropertyOptional({
    type: Number,
    example: 360,
    minimum: 0,
    maximum: 4294967295,
    description: 'Số phút mặc định từ ga đầu đến lúc tàu đến ga này'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4294967295)
  defaultArrivalOffsetMinutes?: number | null;

  @ApiPropertyOptional({
    type: Number,
    example: 370,
    minimum: 0,
    maximum: 4294967295,
    description: 'Số phút mặc định từ ga đầu đến lúc tàu rời ga này'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(4294967295)
  defaultDepartureOffsetMinutes?: number | null;
}
