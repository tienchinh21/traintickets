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
import { StationStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationsService } from './stations.service';

@ApiTags('stations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @RequirePermissions('STATIONS_CREATE')
  @ApiOperation({
    summary: 'Tạo ga',
    description:
      'Tạo ga tàu mới. Code phải viết hoa, không dấu, không khoảng trắng. Yêu cầu permission STATIONS_CREATE.'
  })
  @ApiBody({ type: CreateStationDto })
  @ApiOkResponse({ description: 'Ga đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission STATIONS_CREATE.'
  })
  create(@Body() dto: CreateStationDto) {
    return this.stationsService.create(dto);
  }

  @Get()
  @RequirePermissions('STATIONS_READ')
  @ApiOperation({
    summary: 'Danh sách ga',
    description:
      'Lấy danh sách ga chưa bị xóa mềm, hỗ trợ tìm theo tên/code và lọc theo city/status. Yêu cầu permission STATIONS_READ.'
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
    example: 'HAN',
    description: 'Tìm theo tên ga hoặc mã ga'
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    example: 'Hà Nội',
    description: 'Lọc theo tỉnh/thành phố'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: StationStatus,
    example: 'ACTIVE',
    description: 'Lọc theo trạng thái ACTIVE hoặc INACTIVE'
  })
  @ApiOkResponse({ description: 'Danh sách ga.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission STATIONS_READ.'
  })
  findMany(@Query() query: StationQueryDto) {
    return this.stationsService.findMany(query);
  }

  @Get(':id')
  @RequirePermissions('STATIONS_READ')
  @ApiOperation({
    summary: 'Chi tiết ga',
    description: 'Lấy chi tiết ga theo id, không trả bản ghi đã bị xóa mềm.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga'
  })
  @ApiOkResponse({ description: 'Chi tiết ga.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission STATIONS_READ.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.stationsService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('STATIONS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật ga',
    description:
      'Cập nhật thông tin ga. Code vẫn phải viết hoa, không dấu, không khoảng trắng. Yêu cầu permission STATIONS_UPDATE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga'
  })
  @ApiBody({ type: UpdateStationDto })
  @ApiOkResponse({ description: 'Ga đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission STATIONS_UPDATE.'
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStationDto
  ) {
    return this.stationsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('STATIONS_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm ga',
    description:
      'Không hard delete. Endpoint chỉ cập nhật deletedAt = now. Yêu cầu permission STATIONS_DELETE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ga'
  })
  @ApiOkResponse({ description: 'Ga đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission STATIONS_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.stationsService.delete(id);
  }
}
