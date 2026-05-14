import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min
} from 'class-validator';

export class SearchTripsDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga đi'
  })
  @IsUUID()
  fromStationId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga đến'
  })
  @IsUUID()
  toStationId!: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Ngày vận hành chính, định dạng YYYY-MM-DD'
  })
  @IsDateString()
  serviceDate!: string;

  @ApiPropertyOptional({
    enum: TripStatus,
    example: TripStatus.OPEN,
    description: 'Trạng thái chuyến cần tìm'
  })
  @IsOptional()
  @IsEnum(TripStatus)
  status: TripStatus = TripStatus.OPEN;

  @ApiPropertyOptional({ type: Number, example: 1, minimum: 1, default: 1 })
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
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
