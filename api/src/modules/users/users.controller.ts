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
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('USERS_CREATE')
  @ApiOperation({
    summary: 'Tạo người dùng',
    description:
      'Tạo tài khoản người dùng CMS hoặc khách hàng. BE tự hash password và gán roleIds nếu có.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Người dùng đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission USERS_CREATE.'
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @RequirePermissions('USERS_READ')
  @ApiOperation({
    summary: 'Danh sách người dùng',
    description:
      'Lấy danh sách người dùng kèm vai trò. Hỗ trợ tìm theo họ tên, email hoặc số điện thoại.'
  })
  @ApiOkResponse({ description: 'Danh sách người dùng.' })
  findMany(@Query() query: UserQueryDto) {
    return this.usersService.findMany(query);
  }

  @Get(':id')
  @RequirePermissions('USERS_READ')
  @ApiOperation({
    summary: 'Chi tiết người dùng',
    description: 'Lấy chi tiết người dùng kèm danh sách vai trò.'
  })
  @ApiParam({ name: 'id', example: 'uuid', description: 'ID người dùng' })
  @ApiOkResponse({ description: 'Chi tiết người dùng.' })
  findById(@Param('id') id: string) {
    return this.usersService.findDetailById(id);
  }

  @Patch(':id')
  @RequirePermissions('USERS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật người dùng',
    description:
      'Cập nhật thông tin tài khoản, trạng thái, mật khẩu và danh sách vai trò.'
  })
  @ApiParam({ name: 'id', example: 'uuid', description: 'ID người dùng' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Người dùng đã được cập nhật.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('USERS_DELETE')
  @ApiOperation({
    summary: 'Xóa người dùng',
    description:
      'Xóa mềm người dùng bằng deletedAt và chuyển trạng thái sang INACTIVE.'
  })
  @ApiParam({ name: 'id', example: 'uuid', description: 'ID người dùng' })
  @ApiOkResponse({ description: 'Người dùng đã bị xóa mềm.' })
  delete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
