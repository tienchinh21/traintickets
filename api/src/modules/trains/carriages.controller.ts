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
import { CarriageStatus } from '@prisma/client';
import { Permissions as RequirePermissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CarriagesService } from './carriages.service';
import { CarriageQueryDto } from './dto/carriage-query.dto';
import { CreateCarriageDto } from './dto/create-carriage.dto';
import { SuggestCarriageDto } from './dto/suggest-carriage.dto';
import { UpdateCarriageDto } from './dto/update-carriage.dto';

@ApiTags('carriages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cms')
export class CarriagesController {
  constructor(private readonly carriagesService: CarriagesService) {}

  @Post('trains/:trainId/carriages')
  @RequirePermissions('CARRIAGES_CREATE')
  @ApiOperation({
    summary: 'Tạo toa cho tàu',
    description:
      'Tạo toa thuộc một tàu. trainId phải tồn tại và chưa bị xóa mềm.'
  })
  @ApiParam({
    name: 'trainId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiBody({ type: CreateCarriageDto })
  @ApiOkResponse({ description: 'Toa đã được tạo.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_CREATE.'
  })
  create(
    @Param('trainId', ParseUUIDPipe) trainId: string,
    @Body() dto: CreateCarriageDto
  ) {
    return this.carriagesService.create(trainId, dto);
  }

  @Get('trains/:trainId/carriages')
  @RequirePermissions('CARRIAGES_READ')
  @ApiOperation({
    summary: 'Danh sách toa của tàu',
    description: 'Lấy danh sách toa chưa bị xóa mềm của một tàu.'
  })
  @ApiParam({
    name: 'trainId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Toa 1' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CarriageStatus,
    example: CarriageStatus.ACTIVE
  })
  @ApiOkResponse({ description: 'Danh sách toa.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_READ.'
  })
  findMany(
    @Param('trainId', ParseUUIDPipe) trainId: string,
    @Query() query: CarriageQueryDto
  ) {
    return this.carriagesService.findMany(trainId, query);
  }

  @Post('trains/:trainId/carriages/suggest')
  @RequirePermissions('CARRIAGES_SUGGEST')
  @ApiOperation({
    summary: 'Gợi ý số toa và tên toa',
    description:
      'Sinh số toa tiếp theo trong tàu và tên toa từ loại toa. Đây là preview, khi tạo toa BE vẫn validate unique lại.'
  })
  @ApiParam({
    name: 'trainId',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID tàu'
  })
  @ApiBody({ type: SuggestCarriageDto })
  @ApiOkResponse({ description: 'Gợi ý toa.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_SUGGEST.'
  })
  suggest(
    @Param('trainId', ParseUUIDPipe) trainId: string,
    @Body() dto: SuggestCarriageDto
  ) {
    return this.carriagesService.suggest(trainId, dto);
  }

  @Get('carriages/:id')
  @RequirePermissions('CARRIAGES_READ_DETAIL')
  @ApiOperation({
    summary: 'Chi tiết toa',
    description: 'Lấy chi tiết toa kèm danh sách ghế.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID toa'
  })
  @ApiOkResponse({ description: 'Chi tiết toa.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_READ_DETAIL.'
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.carriagesService.findById(id);
  }

  @Patch('carriages/:id')
  @RequirePermissions('CARRIAGES_UPDATE')
  @ApiOperation({
    summary: 'Cập nhật toa',
    description: 'Cập nhật thông tin toa. Yêu cầu CARRIAGES_UPDATE.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID toa'
  })
  @ApiBody({ type: UpdateCarriageDto })
  @ApiOkResponse({ description: 'Toa đã được cập nhật.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_UPDATE.'
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarriageDto
  ) {
    return this.carriagesService.update(id, dto);
  }

  @Delete('carriages/:id')
  @RequirePermissions('CARRIAGES_DELETE')
  @ApiOperation({
    summary: 'Xóa mềm toa',
    description: 'Không hard delete, chỉ cập nhật deletedAt.'
  })
  @ApiParam({
    name: 'id',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID toa'
  })
  @ApiOkResponse({ description: 'Toa đã được xóa mềm.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({
    description: 'User không có permission CARRIAGES_DELETE.'
  })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.carriagesService.delete(id);
  }
}
