import { ApiProperty } from '@nestjs/swagger';
import { CarriageType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class SuggestCarriageDto {
  @ApiProperty({
    enum: CarriageType,
    example: CarriageType.SEAT,
    description: 'Loại toa cần gợi ý số toa và tên toa'
  })
  @IsEnum(CarriageType)
  carriageType!: CarriageType;
}
