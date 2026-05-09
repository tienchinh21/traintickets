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
  ApiBadRequestResponse,
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
import { SeatStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateSeatDto } from './dto/create-seat.dto';
import { SeatQueryDto } from './dto/seat-query.dto';
import { SeatsService } from './seats.service';
import { UpdateSeatDto } from './dto/update-seat.dto';

@ApiTags('seats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Post('carriages/:carriageId/seats')
  @RequirePermissions('SEATS_CREATE')
  @ApiOperation({
    summary: 'Tạo ghế trong toa',
    description:
      'Tạo ghế thuộc toa. Toa phải tồn tại, chưa bị xóa mềm; loại ghế phải ACTIVE và allowedCarriageTypes phải chứa carriageType của toa.'
  })
  @ApiParam({
    name: 'carriageId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID toa'
  })
  @ApiBody({ type: CreateSeatDto })
  @ApiOkResponse({ description: 'Ghế đã được tạo.' })
  @ApiBadRequestResponse({
    description:
      'Dữ liệu không hợp lệ, ví dụ seatType không phù hợp với carriageType của toa.'
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEATS_CREATE.'
  })
  create(
    @Param('carriageId', ParseUUIDPipe) carriageId: string,
    @Body() dto: CreateSeatDto
  ) {
    return this.seatsService.create(carriageId, dto);
  }

  @Get('carriages/:carriageId/seats')
  @RequirePermissions('SEATS_READ')
  @ApiOperation({
    summary: 'Danh sách ghế của toa',
    description: 'Lấy danh sách ghế chưa bị xóa mềm của một toa.'
  })
  @ApiParam({
    name: 'carriageId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID toa'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'A1' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SeatStatus,
    example: SeatStatus.ACTIVE
  })
  @ApiOkResponse({ description: 'Danh sách ghế.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({ description: 'User không có permission SEATS_READ.' })
  findMany(
    @Param('carriageId', ParseUUIDPipe) carriageId: string,
    @Query() query: SeatQueryDto
  ) {
    return this.seatsService.findMany(carriageId, query);
  }

  @Get('seats/:id')
  @RequirePermissions('SEATS_READ_DETAIL')
  @ApiOperation({
    summary: 'Chi tiết ghế',
    description: 'Lấy chi tiết ghế theo UUID.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ghế'
  })
  @ApiOkResponse({ description: 'Chi tiết ghế.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEATS_READ_DETAIL.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatsService.findById(id);
  }

  @Patch('seats/:id')
  @RequirePermissions('SEATS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật ghế',
    description:
      'Cập nhật thông tin ghế. Nếu đổi seatTypeId thì loại ghế phải ACTIVE và phù hợp với carriageType của toa.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ghế'
  })
  @ApiBody({ type: UpdateSeatDto })
  @ApiOkResponse({ description: 'Ghế đã được cập nhật.' })
  @ApiBadRequestResponse({
    description:
      'Dữ liệu không hợp lệ, ví dụ seatType không phù hợp với carriageType của toa.'
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEATS_UPDATE.'
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSeatDto) {
    return this.seatsService.update(id, dto);
  }

  @Delete('seats/:id')
  @RequirePermissions('SEATS_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm ghế',
    description: 'Không hard delete, chỉ cập nhật deletedAt.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID ghế'
  })
  @ApiOkResponse({ description: 'Ghế đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission SEATS_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatsService.delete(id);
  }
}
