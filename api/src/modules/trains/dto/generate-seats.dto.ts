import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min
} from 'class-validator';

export enum SeatLayoutType {
  SEAT_GRID = 'SEAT_GRID',
  SLEEPER_ROOM = 'SLEEPER_ROOM'
}

export enum SeatNumberingMode {
  ROW_COLUMN = 'ROW_COLUMN',
  NUMERIC = 'NUMERIC',
  ROOM_BED = 'ROOM_BED'
}

export class GenerateSeatsDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID loại ghế áp dụng cho toàn bộ ghế được sinh'
  })
  @IsUUID()
  seatTypeId!: string;

  @ApiProperty({
    enum: SeatLayoutType,
    example: SeatLayoutType.SEAT_GRID,
    description: 'Loại layout dùng để sinh số ghế'
  })
  @IsEnum(SeatLayoutType)
  layoutType!: SeatLayoutType;

  @ApiPropertyOptional({ type: Number, example: 10, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  rows?: number;

  @ApiPropertyOptional({ type: Number, example: 4, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  columns?: number;

  @ApiPropertyOptional({ type: Number, example: 8, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  rooms?: number;

  @ApiPropertyOptional({ type: Number, example: 4, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  bedsPerRoom?: number;

  @ApiPropertyOptional({
    enum: SeatNumberingMode,
    example: SeatNumberingMode.ROW_COLUMN,
    description:
      'ROW_COLUMN sinh A1, A2; NUMERIC sinh 01, 02; ROOM_BED sinh 1A, 1B.'
  })
  @IsOptional()
  @IsEnum(SeatNumberingMode)
  numbering?: SeatNumberingMode;

  @ApiPropertyOptional({
    enum: SeatStatus,
    example: SeatStatus.ACTIVE,
    description: 'Trạng thái áp dụng cho ghế được sinh'
  })
  @IsOptional()
  @IsEnum(SeatStatus)
  status: SeatStatus = SeatStatus.ACTIVE;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Nếu true, chỉ preview danh sách ghế, không ghi DB'
  })
  @IsOptional()
  @IsBoolean()
  previewOnly = false;
}
