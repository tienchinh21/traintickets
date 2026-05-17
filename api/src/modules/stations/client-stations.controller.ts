import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { ClientStationQueryDto } from './dto/client-station-query.dto';
import { StationsService } from './stations.service';

@ApiTags('client-stations')
@Controller('client/stations')
export class ClientStationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách ga khách hàng',
    description:
      'Public endpoint cho FE client lấy danh sách ga ACTIVE, hỗ trợ tìm theo tên/mã và lọc theo tỉnh/thành phố.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'HAN' })
  @ApiQuery({
    name: 'province',
    required: false,
    type: String,
    example: 'Hà Nội'
  })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Hà Nội' })
  @ApiOkResponse({ description: 'Danh sách ga đang hoạt động.' })
  findMany(@Query() query: ClientStationQueryDto) {
    return this.stationsService.findManyForClient(query);
  }
}
