import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class SyncRolePermissionsDto {
  @ApiProperty({
    example: ['ROLES_READ', 'PERMISSIONS_READ', 'STATIONS_READ'],
    description:
      'Danh sách mã quyền active sẽ được gán cho vai trò. API sẽ thay thế toàn bộ danh sách cũ.',
    type: [String]
  })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissionCodes!: string[];
}
