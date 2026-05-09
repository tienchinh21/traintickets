import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID user thực hiện thao tác. Null nếu là hệ thống.'
  })
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @ApiProperty({
    example: 'CREATE_STATION',
    maxLength: 100,
    description: 'Mã hành động cần ghi audit log'
  })
  @IsString()
  @MaxLength(100)
  action!: string;

  @ApiProperty({
    example: 'Station',
    maxLength: 100,
    description: 'Loại thực thể bị tác động'
  })
  @IsString()
  @MaxLength(100)
  entityType!: string;

  @ApiPropertyOptional({
    example: '123',
    maxLength: 100,
    description: 'ID thực thể bị tác động'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityId?: string;

  @ApiPropertyOptional({
    example: { name: 'Ga cũ' },
    description: 'Snapshot dữ liệu trước thay đổi'
  })
  @IsOptional()
  beforeJson?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    example: { name: 'Ga mới' },
    description: 'Snapshot dữ liệu sau thay đổi'
  })
  @IsOptional()
  afterJson?: Prisma.InputJsonValue;

  @ApiPropertyOptional({
    example: '127.0.0.1',
    maxLength: 45,
    description: 'IP người thực hiện'
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0',
    maxLength: 1000,
    description: 'User-Agent người thực hiện'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  userAgent?: string;
}
