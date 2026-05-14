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
import { TripStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateTripDto } from './dto/create-trip.dto';
import { GenerateTripCodeDto } from './dto/generate-trip-code.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripsService } from './trips.service';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cms/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @RequirePermissions('TRIPS_CREATE')
  @ApiOperation({
    summary: 'Tạo chuyến',
    description:
      'Tạo chuyến chạy cụ thể từ route và train, đồng thời sinh trip stops từ route stops.'
  })
  @ApiBody({ type: CreateTripDto })
  @ApiOkResponse({ description: 'Chuyến đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRIPS_CREATE.'
  })
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Get()
  @RequirePermissions('TRIPS_READ')
  @ApiOperation({
    summary: 'Danh sách chuyến',
    description: 'Lấy danh sách chuyến chưa bị xóa mềm.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'SE1' })
  @ApiQuery({ name: 'status', required: false, enum: TripStatus })
  @ApiQuery({ name: 'routeId', required: false, type: String })
  @ApiQuery({ name: 'trainId', required: false, type: String })
  @ApiQuery({ name: 'serviceDate', required: false, type: String })
  @ApiOkResponse({ description: 'Danh sách chuyến.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({ description: 'User không có permission TRIPS_READ.' })
  findMany(@Query() query: TripQueryDto) {
    return this.tripsService.findMany(query);
  }

  @Post('generate-code')
  @RequirePermissions('TRIPS_GENERATE_CODE')
  @ApiOperation({
    summary: 'Tạo mã chuyến gợi ý',
    description:
      'Sinh mã chuyến từ mã tàu và ngày chạy. Đây là preview, khi tạo chuyến BE vẫn validate unique lại.'
  })
  @ApiBody({ type: GenerateTripCodeDto })
  @ApiOkResponse({ description: 'Mã chuyến gợi ý.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRIPS_GENERATE_CODE.'
  })
  generateCode(@Body() dto: GenerateTripCodeDto) {
    return this.tripsService.generateCode(dto);
  }

  @Post('search')
  @RequirePermissions('TRIPS_READ')
  @ApiOperation({
    summary: 'Tìm chuyến theo ga đi, ga đến và ngày',
    description:
      'Tìm chuyến có ga đi đứng trước ga đến trong danh sách trip stops.'
  })
  @ApiBody({ type: SearchTripsDto })
  @ApiOkResponse({ description: 'Danh sách chuyến phù hợp.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({ description: 'User không có permission TRIPS_READ.' })
  search(@Body() dto: SearchTripsDto) {
    return this.tripsService.search(dto);
  }

  @Get(':id')
  @RequirePermissions('TRIPS_READ')
  @ApiOperation({
    summary: 'Chi tiết chuyến',
    description: 'Lấy chi tiết chuyến kèm route, train và trip stops.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID chuyến'
  })
  @ApiOkResponse({ description: 'Chi tiết chuyến.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({ description: 'User không có permission TRIPS_READ.' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('TRIPS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật chuyến',
    description:
      'Cập nhật chuyến. Khi đổi route hoặc service date, hệ thống sinh lại trip stops.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID chuyến'
  })
  @ApiBody({ type: UpdateTripDto })
  @ApiOkResponse({ description: 'Chuyến đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRIPS_UPDATE.'
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTripDto) {
    return this.tripsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('TRIPS_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm chuyến',
    description: 'Không hard delete, chỉ cập nhật deletedAt.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID chuyến'
  })
  @ApiOkResponse({ description: 'Chuyến đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRIPS_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.delete(id);
  }
}
