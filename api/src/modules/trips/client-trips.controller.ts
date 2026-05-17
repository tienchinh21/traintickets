import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { ClientSearchTripsDto } from './dto/client-search-trips.dto';
import { TripsService } from './trips.service';

@ApiTags('client-trips')
@Controller('client/trips')
export class ClientTripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post('search')
  @ApiOperation({
    summary: 'Tìm chuyến cho khách hàng',
    description:
      'Public endpoint tìm chuyến OPEN theo ga đi, ga đến, ngày vận hành và giờ khởi hành sớm nhất.'
  })
  @ApiBody({ type: ClientSearchTripsDto })
  @ApiOkResponse({ description: 'Danh sách chuyến phù hợp.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu tìm kiếm không hợp lệ.' })
  search(@Body() dto: ClientSearchTripsDto) {
    return this.tripsService.searchForClient(dto);
  }
}
