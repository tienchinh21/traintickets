import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min
} from 'class-validator';

export class CreateSeatDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID loại ghế, phải tồn tại và đang ACTIVE'
  })
  @IsUUID()
  seatTypeId!: string;

  @ApiProperty({
    example: 'A1',
    maxLength: 20,
    description: 'Số ghế trong toa, không được trùng trong cùng toa'
  })
  @IsString()
  @MaxLength(20)
  seatNumber!: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    description: 'Dòng hiển thị trên sơ đồ ghế'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rowNumber?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 2,
    minimum: 1,
    description: 'Cột hiển thị trên sơ đồ ghế'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  columnNumber?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    description: 'Tầng giường nằm nếu có'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  floorNumber?: number;

  @ApiProperty({
    enum: SeatStatus,
    example: SeatStatus.ACTIVE,
    description: 'Trạng thái ghế'
  })
  @IsEnum(SeatStatus)
  status: SeatStatus = SeatStatus.ACTIVE;
}
