import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatTypeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Min
} from 'class-validator';

export class CreateSeatTypeDto {
  @ApiProperty({
    example: 'SOFT_SEAT',
    maxLength: 30,
    pattern: '^[A-Z0-9]+(?:_[A-Z0-9]+)*$',
    description: 'Mã loại ghế viết hoa, không dấu, cho phép dấu gạch dưới'
  })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/)
  code!: string;

  @ApiProperty({
    example: 'Ghế mềm',
    maxLength: 100,
    description: 'Tên loại ghế hiển thị'
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Ghế mềm điều hòa.',
    maxLength: 500,
    description: 'Mô tả tiện ích hoặc điều kiện của loại ghế'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    type: Number,
    example: 1.2,
    minimum: 0.01,
    description: 'Hệ số nhân giá so với giá cơ bản, phải lớn hơn 0'
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  baseMultiplier!: number;

  @ApiProperty({
    enum: SeatTypeStatus,
    example: SeatTypeStatus.ACTIVE,
    description: 'Trạng thái loại ghế'
  })
  @IsEnum(SeatTypeStatus)
  status: SeatTypeStatus = SeatTypeStatus.ACTIVE;
}
