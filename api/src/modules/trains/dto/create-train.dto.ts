import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrainStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches
} from 'class-validator';

export class CreateTrainDto {
  @ApiProperty({
    example: 'SE1',
    maxLength: 30,
    pattern: '^[A-Z0-9]+$',
    description: 'Mã tàu duy nhất, viết hoa, không dấu, không khoảng trắng'
  })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Z0-9]+$/)
  code!: string;

  @ApiProperty({
    example: 'Tàu SE1',
    maxLength: 255,
    description: 'Tên tàu hiển thị cho vận hành'
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Tàu Thống Nhất chạy tuyến Bắc Nam.',
    maxLength: 1000,
    description: 'Mô tả hoặc ghi chú cấu hình tàu'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    enum: TrainStatus,
    example: TrainStatus.ACTIVE,
    description: 'Trạng thái tàu'
  })
  @IsEnum(TrainStatus)
  status: TrainStatus = TrainStatus.ACTIVE;
}
