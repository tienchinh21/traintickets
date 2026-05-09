import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Matches
} from 'class-validator';

export class CreateStationDto {
  @ApiProperty({
    example: 'HAN',
    maxLength: 20,
    pattern: '^[A-Z0-9]+$',
    description: 'Mã ga duy nhất, viết hoa, không dấu, không khoảng trắng'
  })
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/)
  code!: string;

  @ApiProperty({
    example: 'Ga Hà Nội',
    maxLength: 255,
    description: 'Tên ga hiển thị cho khách hàng và nhân viên vận hành'
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    example: 'ga-ha-noi',
    maxLength: 255,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    description: 'Slug URL-friendly duy nhất của ga'
  })
  @IsString()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiPropertyOptional({
    example: 'Hà Nội',
    maxLength: 100,
    description: 'Tỉnh hoặc thành phố của ga'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: '120 Lê Duẩn, Hoàn Kiếm',
    maxLength: 500,
    description: 'Địa chỉ chi tiết của ga'
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({
    example: 21.0245,
    description: 'Vĩ độ của ga, dùng cho bản đồ hoặc tính khoảng cách'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    example: 105.8412,
    description: 'Kinh độ của ga, dùng cho bản đồ hoặc tính khoảng cách'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'Asia/Ho_Chi_Minh',
    maxLength: 50,
    default: 'Asia/Ho_Chi_Minh',
    description: 'Múi giờ vận hành của ga'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string = 'Asia/Ho_Chi_Minh';

  @ApiProperty({
    enum: StationStatus,
    example: StationStatus.ACTIVE,
    description: 'Trạng thái ga. Ga INACTIVE không dùng để bán vé mới.'
  })
  @IsEnum(StationStatus)
  status: StationStatus = StationStatus.ACTIVE;
}
