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
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @RequirePermissions('PERMISSIONS_CREATE')
  @ApiOperation({
    summary: 'Tạo quyền',
    description:
      'Tạo permission động. method/path là bắt buộc vì guard check quyền theo route runtime.'
  })
  @ApiBody({ type: CreatePermissionDto })
  @ApiOkResponse({ description: 'Quyền đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission PERMISSIONS_CREATE.'
  })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @RequirePermissions('PERMISSIONS_READ')
  @ApiOperation({
    summary: 'Danh sách quyền',
    description:
      'Lấy danh sách permissions, gồm code/module/action/method/path/status. Yêu cầu permission PERMISSIONS_READ.'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    example: 'STATIONS',
    description: 'Tìm theo code, tên quyền hoặc module'
  })
  @ApiOkResponse({ description: 'Danh sách quyền.' })
  findMany(@Query('search') search?: string) {
    return this.permissionsService.findMany(search);
  }

  @Get(':id')
  @RequirePermissions('PERMISSIONS_READ')
  @ApiOperation({
    summary: 'Chi tiết quyền',
    description: 'Lấy chi tiết permission theo id.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID quyền' })
  @ApiOkResponse({ description: 'Chi tiết quyền.' })
  findById(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.permissionsService.findById(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions('PERMISSIONS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật quyền',
    description:
      'Cập nhật permission, bao gồm method/path để đổi route policy runtime. Yêu cầu PERMISSIONS_UPDATE.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID quyền' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiOkResponse({ description: 'Quyền đã được cập nhật.' })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdatePermissionDto
  ) {
    return this.permissionsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions('PERMISSIONS_DELETE')
  @ApiOperation({
    summary: 'Vô hiệu hóa quyền',
    description:
      'Chuyển permission sang INACTIVE. Request kế tiếp sẽ không còn pass guard theo quyền này.'
  })
  @ApiParam({ name: 'id', example: 1, description: 'ID quyền' })
  @ApiOkResponse({ description: 'Quyền đã bị vô hiệu hóa.' })
  deactivate(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.permissionsService.deactivate(BigInt(id));
  }
}
