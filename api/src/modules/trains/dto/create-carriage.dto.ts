import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarriageStatus, CarriageType } from '@prisma/client';
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
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    minimum: 1,
    description:
      'Số thứ tự toa trong cùng tàu. Nếu không gửi, BE tự lấy số tiếp theo.'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  carriageNumber?: number;

  @ApiPropertyOptional({
    example: 'Toa 1 - Ghế ngồi',
    maxLength: 100,
    description:
      'Tên toa hiển thị. Nếu không gửi, BE tự sinh từ số toa và loại toa.'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    enum: CarriageType,
    example: CarriageType.SEAT,
    description:
      'Loại toa chính thức. SEAT: toa ghế ngồi, SLEEPER: toa giường nằm, VIP: toa VIP.'
  })
  @IsEnum(CarriageType)
  carriageType!: CarriageType;

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
