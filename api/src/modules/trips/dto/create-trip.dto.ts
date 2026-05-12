import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tuyến mẫu của chuyến'
  })
  @IsUUID()
  routeId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu dùng cho chuyến'
  })
  @IsUUID()
  trainId!: string;

  @ApiProperty({
    example: 'SE1-20260601',
    maxLength: 50,
    description: 'Mã chuyến duy nhất'
  })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Ngày vận hành chính, định dạng YYYY-MM-DD'
  })
  @IsDateString()
  serviceDate!: string;

  @ApiProperty({
    enum: TripStatus,
    example: TripStatus.DRAFT,
    description: 'Trạng thái chuyến'
  })
  @IsEnum(TripStatus)
  status: TripStatus = TripStatus.DRAFT;
}
