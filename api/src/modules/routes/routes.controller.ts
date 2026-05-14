import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
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
import { RouteStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateRouteDto } from './dto/create-route.dto';
import { GenerateRouteCodeDto } from './dto/generate-route-code.dto';
import { RouteQueryDto } from './dto/route-query.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesService } from './routes.service';

@ApiTags('routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cms/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @RequirePermissions('ROUTES_CREATE')
  @ApiOperation({
    summary: 'Tạo tuyến',
    description:
      'Tạo tuyến mới kèm danh sách ga dừng. Yêu cầu ít nhất 2 ga, thứ tự ga và station không trùng, khoảng cách tăng dần. Yêu cầu permission ROUTES_CREATE.'
  })
  @ApiBody({ type: CreateRouteDto })
  @ApiOkResponse({ description: 'Tuyến đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_CREATE.'
  })
  create(@Body() dto: CreateRouteDto) {
    return this.routesService.create(dto);
  }

  @Get()
  @RequirePermissions('ROUTES_READ')
  @ApiOperation({
    summary: 'Danh sách tuyến',
    description:
      'Lấy danh sách tuyến chưa bị xóa mềm, hỗ trợ tìm theo tên/code và lọc theo status. Yêu cầu permission ROUTES_READ.'
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
    example: 'HN-DN',
    description: 'Tìm theo tên tuyến hoặc mã tuyến'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RouteStatus,
    example: RouteStatus.ACTIVE,
    description: 'Lọc theo trạng thái ACTIVE hoặc INACTIVE'
  })
  @ApiOkResponse({ description: 'Danh sách tuyến.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_READ.'
  })
  findMany(@Query() query: RouteQueryDto) {
    return this.routesService.findMany(query);
  }

  @Post('generate-code')
  @RequirePermissions('ROUTES_CREATE')
  @ApiOperation({
    summary: 'Tạo mã tuyến gợi ý',
    description:
      'Sinh mã tuyến từ ga đầu và ga cuối. Đây là preview, khi tạo tuyến BE vẫn validate unique lại.'
  })
  @ApiBody({ type: GenerateRouteCodeDto })
  @ApiOkResponse({ description: 'Mã tuyến gợi ý.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_CREATE.'
  })
  generateCode(@Body() dto: GenerateRouteCodeDto) {
    return this.routesService.generateCode(dto);
  }

  @Get(':id')
  @RequirePermissions('ROUTES_READ')
  @ApiOperation({
    summary: 'Chi tiết tuyến',
    description:
      'Lấy chi tiết tuyến theo id kèm danh sách ga dừng, không trả bản ghi đã bị xóa mềm.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tuyến'
  })
  @ApiOkResponse({ description: 'Chi tiết tuyến.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_READ.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('ROUTES_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật tuyến',
    description:
      'Cập nhật thông tin tuyến. Nếu gửi stops thì thay thế toàn bộ danh sách ga dừng hiện tại trong transaction. Yêu cầu permission ROUTES_UPDATE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tuyến'
  })
  @ApiBody({ type: UpdateRouteDto })
  @ApiOkResponse({ description: 'Tuyến đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_UPDATE.'
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRouteDto) {
    return this.routesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('ROUTES_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm tuyến',
    description:
      'Không hard delete. Endpoint chỉ cập nhật deletedAt = now. Yêu cầu permission ROUTES_DELETE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tuyến'
  })
  @ApiOkResponse({ description: 'Tuyến đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission ROUTES_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.delete(id);
  }
}
