import { ApiPropertyOptional } from '@nestjs/swagger';
import { StationStatus } from '@prisma/client';
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

export class StationQueryDto {
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
    example: 'HAN',
    description: 'Tìm theo tên ga hoặc mã ga'
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    example: 'Hà Nội',
    description: 'Lọc theo tỉnh/thành phố'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    enum: StationStatus,
    example: StationStatus.ACTIVE,
    description: 'Lọc theo trạng thái ga'
  })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;
}
