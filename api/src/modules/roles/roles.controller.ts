import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe';
import { CreateRoleDto } from './dto/create-role.dto';
import { SyncRolePermissionsDto } from './dto/sync-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cms/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('ROLES_CREATE')
  @ApiOperation({
    summary: 'Tạo vai trò',
    description:
      'Tạo role mới để gán cho user. Yêu cầu permission ROLES_CREATE theo DB runtime.'
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiOkResponse({ description: 'Vai trò đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROLES_CREATE.'
  })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  @RequirePermissions('ROLES_READ')
  @ApiOperation({
    summary: 'Danh sách vai trò',
    description:
      'Lấy danh sách role kèm permissions đang gán. Yêu cầu permission ROLES_READ.'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'ADMIN',
    description: 'Tìm theo code hoặc tên vai trò'
  })
  @ApiOkResponse({ description: 'Danh sách vai trò.' })
  findMany(@Query('search') search?: string) {
    return this.rolesService.findMany(search);
  }

  @Get(':id')
  @RequirePermissions('ROLES_READ')
  @ApiOperation({
    summary: 'Chi tiết vai trò',
    description: 'Lấy chi tiết role theo id, bao gồm danh sách permissions.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID vai trò' })
  @ApiOkResponse({ description: 'Chi tiết vai trò.' })
  findById(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.rolesService.findById(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions('ROLES_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật vai trò',
    description: 'Cập nhật thông tin role. Yêu cầu permission ROLES_UPDATE.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID vai trò' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'Vai trò đã được cập nhật.' })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateRoleDto
  ) {
    return this.rolesService.update(BigInt(id), dto);
  }

  @Patch(':id/permissions')
  @RequirePermissions('ROLES_SYNC_PERMISSIONS')
  @ApiOperation({
    summary: 'Gán quyền cho vai trò',
    description:
      'Thay thế toàn bộ permissions hiện tại của role bằng danh sách permissionCodes. Có hiệu lực ngay ở request kế tiếp vì guard check DB runtime.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID vai trò' })
  @ApiBody({ type: SyncRolePermissionsDto })
  @ApiOkResponse({
    description: 'Danh sách quyền của vai trò đã được đồng bộ.'
  })
  syncPermissions(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: SyncRolePermissionsDto
  ) {
    return this.rolesService.syncPermissions(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions('ROLES_DELETE')
  @ApiOperation({
    summary: 'Vô hiệu hóa vai trò',
    description:
      'Soft-deactivate role bằng cách chuyển status sang INACTIVE. Yêu cầu permission ROLES_DELETE.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID vai trò' })
  @ApiOkResponse({ description: 'Vai trò đã bị vô hiệu hóa.' })
  deactivate(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.rolesService.deactivate(BigInt(id));
  }
}
