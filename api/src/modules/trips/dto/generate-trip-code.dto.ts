import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class GenerateTripCodeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu dùng để sinh mã chuyến'
  })
  @IsUUID()
  trainId!: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Ngày vận hành chính, định dạng YYYY-MM-DD'
  })
  @IsDateString()
  serviceDate!: string;
}
