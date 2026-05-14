import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
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

  @ApiPropertyOptional({
    example: 'SE1-20260601',
    maxLength: 50,
    pattern: '^[A-Z0-9]+-[0-9]{8}(?:-[0-9]{2})?$',
    description:
      'Mã chuyến duy nhất. Nếu không gửi, BE tự sinh từ mã tàu và ngày chạy.'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+-[0-9]{8}(?:-[0-9]{2})?$/)
  code?: string;

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
