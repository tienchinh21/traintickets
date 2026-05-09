import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái API',
    description: 'Kiểm tra service backend và kết nối MySQL thông qua Prisma.'
  })
  @ApiOkResponse({
    description: 'API hoạt động và database kết nối được.'
  })
  check() {
    return this.healthService.check();
  }
}
