import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min
} from 'class-validator';

export class ClientSearchTripsDto {
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
    description: 'Ngày vận hành, định dạng YYYY-MM-DD'
  })
  @IsDateString()
  serviceDate!: string;

  @ApiProperty({
    example: '08:00',
    description: 'Giờ khởi hành sớm nhất, định dạng HH:mm'
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  departureTime!: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    maximum: 6,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  passengers = 1;

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
