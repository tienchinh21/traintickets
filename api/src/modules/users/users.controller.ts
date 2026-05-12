import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UserStatus, UserType } from '@prisma/client';
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
@Controller('cms/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('USERS_CREATE')
  @ApiOperation({
    summary: 'Tạo người dùng',
    description:
      'Tạo tài khoản người dùng CMS hoặc khách hàng. BE tự hash password và gán roleIds nếu có. Yêu cầu permission USERS_CREATE.'
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
      'Lấy danh sách người dùng summary kèm vai trò ngắn gọn. Hỗ trợ tìm theo họ tên, email hoặc số điện thoại. Yêu cầu permission USERS_READ.'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Trang hiện tại'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Số bản ghi mỗi trang, tối đa 100'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'admin',
    description: 'Tìm theo họ tên, email hoặc số điện thoại'
  })
  @ApiQuery({
    name: 'userType',
    required: false,
    enum: UserType,
    example: UserType.STAFF,
    description: 'Lọc theo loại người dùng'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Lọc theo trạng thái tài khoản'
  })
  @ApiOkResponse({ description: 'Danh sách người dùng.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission USERS_READ.'
  })
  findMany(@Query() query: UserQueryDto) {
    return this.usersService.findMany(query);
  }

  @Get(':id')
  @RequirePermissions('USERS_READ')
  @ApiOperation({
    summary: 'Chi tiết người dùng',
    description:
      'Lấy chi tiết người dùng kèm danh sách vai trò. Yêu cầu permission USERS_READ.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID người dùng'
  })
  @ApiOkResponse({ description: 'Chi tiết người dùng.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission USERS_READ.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findDetailById(id);
  }

  @Patch(':id')
  @RequirePermissions('USERS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật người dùng',
    description:
      'Cập nhật thông tin tài khoản, trạng thái, mật khẩu và danh sách vai trò. Mutate endpoint chỉ trả message.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID người dùng'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Người dùng đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission USERS_UPDATE.'
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('USERS_DELETE')
  @ApiOperation({
    summary: 'Xóa người dùng',
    description:
      'Xóa mềm người dùng bằng deletedAt và chuyển trạng thái sang INACTIVE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID người dùng'
  })
  @ApiOkResponse({ description: 'Người dùng đã bị xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission USERS_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.softDelete(id);
  }
}
