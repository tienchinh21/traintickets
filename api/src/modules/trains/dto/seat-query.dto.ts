import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeatStatus } from '@prisma/client';
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

export class SeatQueryDto {
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
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50,
    description: 'Số bản ghi mỗi trang'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @ApiPropertyOptional({
    example: 'A1',
    description: 'Tìm theo số ghế'
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  search?: string;

  @ApiPropertyOptional({
    enum: SeatStatus,
    example: SeatStatus.ACTIVE,
    description: 'Lọc theo trạng thái ghế'
  })
  @IsOptional()
  @IsEnum(SeatStatus)
  status?: SeatStatus;
}
