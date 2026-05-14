import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { AdministrativeDivisionsService } from './administrative-divisions.service';

enum DivisionDatasetVersion {
  OLD = 'old',
  CURRENT_2025 = '2025'
}

@ApiTags('administrative-divisions')
@Controller('administrative-divisions')
export class AdministrativeDivisionsController {
  constructor(
    private readonly administrativeDivisionsService: AdministrativeDivisionsService
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Tóm tắt dữ liệu địa giới hành chính',
    description:
      'Trả metadata và danh sách endpoint nội bộ để FE lấy dữ liệu tỉnh, quận/huyện, xã/phường.'
  })
  @ApiOkResponse({ description: 'Tóm tắt hai bộ dữ liệu.' })
  getSummary() {
    return this.administrativeDivisionsService.getSummary();
  }

  @Get('old/provinces')
  @ApiOperation({ summary: 'Danh sách tỉnh/thành cũ trước sáp nhập' })
  @ApiQuery({ name: 'search', required: false, type: String })
  listOldProvinces(@Query('search') search?: string) {
    return this.administrativeDivisionsService.listOldProvinces(search);
  }

  @Get('old/provinces/:code')
  @ApiOperation({ summary: 'Chi tiết tỉnh/thành cũ trước sáp nhập' })
  @ApiParam({ name: 'code', type: Number })
  @ApiQuery({
    name: 'depth',
    required: false,
    type: Number,
    description: 'depth=2 lấy kèm quận/huyện, depth=3 lấy kèm xã/phường'
  })
  getOldProvince(
    @Param('code', ParseIntPipe) code: number,
    @Query('depth') depth?: number
  ) {
    return this.administrativeDivisionsService.getOldProvince(code, depth);
  }

  @Get('old/districts')
  @ApiOperation({ summary: 'Danh sách quận/huyện cũ trước sáp nhập' })
  @ApiQuery({ name: 'provinceCode', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  listOldDistricts(
    @Query('provinceCode') provinceCode?: number,
    @Query('search') search?: string
  ) {
    return this.administrativeDivisionsService.listOldDistricts(
      provinceCode,
      search
    );
  }

  @Get('old/districts/:code')
  @ApiOperation({ summary: 'Chi tiết quận/huyện cũ trước sáp nhập' })
  @ApiParam({ name: 'code', type: Number })
  @ApiQuery({
    name: 'depth',
    required: false,
    type: Number,
    description: 'depth=2 lấy kèm xã/phường'
  })
  getOldDistrict(
    @Param('code', ParseIntPipe) code: number,
    @Query('depth') depth?: number
  ) {
    return this.administrativeDivisionsService.getOldDistrict(code, depth);
  }

  @Get('old/wards')
  @ApiOperation({ summary: 'Danh sách xã/phường cũ trước sáp nhập' })
  @ApiQuery({ name: 'districtCode', required: false, type: Number })
  @ApiQuery({ name: 'provinceCode', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  listOldWards(
    @Query('districtCode') districtCode?: number,
    @Query('provinceCode') provinceCode?: number,
    @Query('search') search?: string
  ) {
    return this.administrativeDivisionsService.listOldWards(
      districtCode,
      provinceCode,
      search
    );
  }

  @Get('old/wards/:code')
  @ApiOperation({ summary: 'Chi tiết xã/phường cũ trước sáp nhập' })
  @ApiParam({ name: 'code', type: Number })
  getOldWard(@Param('code', ParseIntPipe) code: number) {
    return this.administrativeDivisionsService.getOldWard(code);
  }

  @Get('2025/provinces')
  @ApiOperation({ summary: 'Danh sách tỉnh/thành sau sáp nhập 2025' })
  @ApiQuery({ name: 'search', required: false, type: String })
  list2025Provinces(@Query('search') search?: string) {
    return this.administrativeDivisionsService.list2025Provinces(search);
  }

  @Get('2025/provinces/:code')
  @ApiOperation({ summary: 'Chi tiết tỉnh/thành sau sáp nhập 2025' })
  @ApiParam({ name: 'code', type: Number })
  @ApiQuery({
    name: 'depth',
    required: false,
    type: Number,
    description: 'depth=2 lấy kèm xã/phường/đặc khu'
  })
  get2025Province(
    @Param('code', ParseIntPipe) code: number,
    @Query('depth') depth?: number
  ) {
    return this.administrativeDivisionsService.get2025Province(code, depth);
  }

  @Get('2025/wards')
  @ApiOperation({ summary: 'Danh sách xã/phường/đặc khu sau sáp nhập 2025' })
  @ApiQuery({ name: 'provinceCode', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  list2025Wards(
    @Query('provinceCode') provinceCode?: number,
    @Query('search') search?: string
  ) {
    return this.administrativeDivisionsService.list2025Wards(
      provinceCode,
      search
    );
  }

  @Get('2025/wards/from-legacy')
  @ApiOperation({
    summary: 'Tra xã/phường mới từ tên hoặc mã xã/phường cũ'
  })
  @ApiQuery({ name: 'legacyName', required: false, type: String })
  @ApiQuery({ name: 'legacyCode', required: false, type: Number })
  lookup2025WardFromLegacy(
    @Query('legacyName') legacyName?: string,
    @Query('legacyCode') legacyCode?: number
  ) {
    return this.administrativeDivisionsService.lookup2025WardFromLegacy(
      legacyName,
      legacyCode
    );
  }

  @Get('2025/wards/:code/to-legacies')
  @ApiOperation({ summary: 'Danh sách xã/phường cũ tương ứng xã/phường mới' })
  @ApiParam({ name: 'code', type: Number })
  get2025WardLegacies(@Param('code', ParseIntPipe) code: number) {
    return this.administrativeDivisionsService.get2025WardLegacies(code);
  }

  @Get('2025/wards/:code')
  @ApiOperation({ summary: 'Chi tiết xã/phường/đặc khu sau sáp nhập 2025' })
  @ApiParam({ name: 'code', type: Number })
  get2025Ward(@Param('code', ParseIntPipe) code: number) {
    return this.administrativeDivisionsService.get2025Ward(code);
  }

  @Get('openapi/:version')
  @ApiOperation({
    summary: 'Lấy OpenAPI gốc của nguồn dữ liệu',
    description:
      'Endpoint phụ để kiểm tra contract nguồn, FE không cần dùng cho danh sách địa giới.'
  })
  @ApiParam({
    name: 'version',
    enum: DivisionDatasetVersion,
    example: DivisionDatasetVersion.CURRENT_2025
  })
  @ApiOkResponse({ description: 'Nội dung OpenAPI JSON.' })
  getOpenApi(
    @Param('version', new ParseEnumPipe(DivisionDatasetVersion))
    version: DivisionDatasetVersion
  ) {
    return this.administrativeDivisionsService.getOpenApi(version);
  }
}
