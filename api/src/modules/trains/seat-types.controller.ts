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
import { SeatTypeStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateSeatTypeDto } from './dto/create-seat-type.dto';
import { SeatTypeQueryDto } from './dto/seat-type-query.dto';
import { UpdateSeatTypeDto } from './dto/update-seat-type.dto';
import { SeatTypesService } from './seat-types.service';

@ApiTags('seat-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cms/seat-types')
export class SeatTypesController {
  constructor(private readonly seatTypesService: SeatTypesService) {}

  @Post()
  @RequirePermissions('SEAT_TYPES_CREATE')
  @ApiOperation({
    summary: 'Tạo loại ghế',
    description: 'Yêu cầu SEAT_TYPES_CREATE.'
  })
  @ApiBody({ type: CreateSeatTypeDto })
  @ApiOkResponse({ description: 'Loại ghế đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEAT_TYPES_CREATE.'
  })
  create(@Body() dto: CreateSeatTypeDto) {
    return this.seatTypesService.create(dto);
  }

  @Get()
  @RequirePermissions('SEAT_TYPES_READ')
  @ApiOperation({
    summary: 'Danh sách loại ghế',
    description: 'Lấy danh sách loại ghế cấu hình.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'SOFT_SEAT'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SeatTypeStatus,
    example: SeatTypeStatus.ACTIVE
  })
  @ApiOkResponse({ description: 'Danh sách loại ghế.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEAT_TYPES_READ.'
  })
  findMany(@Query() query: SeatTypeQueryDto) {
    return this.seatTypesService.findMany(query);
  }

  @Get(':id')
  @RequirePermissions('SEAT_TYPES_READ')
  @ApiOperation({
    summary: 'Chi tiết loại ghế',
    description: 'Lấy loại ghế theo UUID.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID loại ghế'
  })
  @ApiOkResponse({ description: 'Chi tiết loại ghế.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEAT_TYPES_READ.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatTypesService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('SEAT_TYPES_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật loại ghế',
    description: 'Yêu cầu SEAT_TYPES_UPDATE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID loại ghế'
  })
  @ApiBody({ type: UpdateSeatTypeDto })
  @ApiOkResponse({ description: 'Loại ghế đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEAT_TYPES_UPDATE.'
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeatTypeDto
  ) {
    return this.seatTypesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('SEAT_TYPES_DELETE')
  @ApiOperation({
    summary: 'Vô hiệu hóa loại ghế',
    description:
      'Seat types không có deletedAt, endpoint chuyển status về INACTIVE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID loại ghế'
  })
  @ApiOkResponse({ description: 'Loại ghế đã được vô hiệu hóa.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEAT_TYPES_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatTypesService.delete(id);
  }
}
