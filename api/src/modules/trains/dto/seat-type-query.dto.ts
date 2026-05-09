import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeatTypeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from 'class-validator';

export class SeatTypeQueryDto {
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Trang hiện tại'
  })
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
    default: 20,
    description: 'Số bản ghi mỗi trang'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    example: 'SOFT_SEAT',
    description: 'Tìm theo mã hoặc tên loại ghế'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: SeatTypeStatus,
    example: SeatTypeStatus.ACTIVE,
    description: 'Lọc theo trạng thái loại ghế'
  })
  @IsOptional()
  @IsEnum(SeatTypeStatus)
  status?: SeatTypeStatus;
}
