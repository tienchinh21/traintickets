import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  ValidateNested
} from 'class-validator';
import { RouteStopDto } from './route-stop.dto';

export class CreateRouteDto {
  @ApiProperty({
    example: 'HN-DN',
    maxLength: 30,
    pattern: '^[A-Z0-9]+(?:-[A-Z0-9]+)*$',
    description:
      'Mã tuyến duy nhất, viết hoa, không dấu, cho phép dấu gạch ngang'
  })
  @IsString()
  @MaxLength(30)
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
  code!: string;

  @ApiProperty({
    example: 'Hà Nội - Đà Nẵng',
    maxLength: 255,
    description: 'Tên tuyến hiển thị cho nhân viên vận hành'
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Tuyến Bắc Trung Bộ kết nối Hà Nội, Vinh và Đà Nẵng.',
    maxLength: 1000,
    description: 'Mô tả tuyến cho vận hành hoặc SEO sau này'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    enum: RouteStatus,
    example: RouteStatus.ACTIVE,
    description: 'Trạng thái tuyến. Tuyến INACTIVE không dùng để mở bán mới.'
  })
  @IsEnum(RouteStatus)
  status: RouteStatus = RouteStatus.ACTIVE;

  @ApiProperty({
    type: [RouteStopDto],
    description: 'Danh sách ga dừng. Một tuyến phải có ít nhất 2 ga.'
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops!: RouteStopDto[];
}
