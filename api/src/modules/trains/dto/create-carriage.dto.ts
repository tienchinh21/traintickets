import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarriageStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from 'class-validator';

export class CreateCarriageDto {
  @ApiProperty({
    type: Number,
    example: 1,
    minimum: 1,
    description: 'Số thứ tự toa trong cùng tàu, không được trùng'
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  carriageNumber!: number;

  @ApiProperty({
    example: 'Toa 1 ghế ngồi',
    maxLength: 100,
    description: 'Tên toa hiển thị'
  })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'SEAT',
    maxLength: 50,
    description: 'Loại toa như SEAT, SLEEPER hoặc VIP'
  })
  @IsString()
  @MaxLength(50)
  carriageType!: string;

  @ApiPropertyOptional({
    example: { rows: 10, columns: 4, aisleAfterColumn: 2 },
    description: 'JSON layout để client render sơ đồ ghế'
  })
  @IsOptional()
  @IsObject()
  seatMapLayout?: Record<string, unknown>;

  @ApiProperty({
    enum: CarriageStatus,
    example: CarriageStatus.ACTIVE,
    description: 'Trạng thái toa'
  })
  @IsEnum(CarriageStatus)
  status: CarriageStatus = CarriageStatus.ACTIVE;
}
