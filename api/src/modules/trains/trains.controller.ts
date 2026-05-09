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
import { TrainStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateTrainDto } from './dto/create-train.dto';
import { TrainQueryDto } from './dto/train-query.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { TrainsService } from './trains.service';

@ApiTags('trains')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Post()
  @RequirePermissions('TRAINS_CREATE')
  @ApiOperation({
    summary: 'Tạo tàu',
    description: 'Tạo tàu vật lý mới. Yêu cầu permission TRAINS_CREATE.'
  })
  @ApiBody({ type: CreateTrainDto })
  @ApiOkResponse({ description: 'Tàu đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRAINS_CREATE.'
  })
  create(@Body() dto: CreateTrainDto) {
    return this.trainsService.create(dto);
  }

  @Get()
  @RequirePermissions('TRAINS_READ')
  @ApiOperation({
    summary: 'Danh sách tàu',
    description:
      'Lấy danh sách tàu chưa bị xóa mềm, không trả nested carriages/seats.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'SE1' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TrainStatus,
    example: TrainStatus.ACTIVE
  })
  @ApiOkResponse({ description: 'Danh sách tàu.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRAINS_READ.'
  })
  findMany(@Query() query: TrainQueryDto) {
    return this.trainsService.findMany(query);
  }

  @Get(':id')
  @RequirePermissions('TRAINS_READ')
  @ApiOperation({
    summary: 'Chi tiết tàu',
    description: 'Lấy chi tiết tàu kèm danh sách toa summary.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiOkResponse({ description: 'Chi tiết tàu.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRAINS_READ.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainsService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions('TRAINS_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật tàu',
    description: 'Cập nhật thông tin tàu. Yêu cầu permission TRAINS_UPDATE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiBody({ type: UpdateTrainDto })
  @ApiOkResponse({ description: 'Tàu đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRAINS_UPDATE.'
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTrainDto) {
    return this.trainsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('TRAINS_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm tàu',
    description:
      'Không hard delete, chỉ cập nhật deletedAt. Yêu cầu TRAINS_DELETE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiOkResponse({ description: 'Tàu đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission TRAINS_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainsService.delete(id);
  }
}
