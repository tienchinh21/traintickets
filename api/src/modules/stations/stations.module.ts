import { Module } from '@nestjs/common';
import { ClientStationsController } from './client-stations.controller';
import { StationsController } from './stations.controller';
import { StationsService } from './stations.service';

@Module({
  controllers: [StationsController, ClientStationsController],
  providers: [StationsService],
  exports: [StationsService]
})
export class StationsModule {}
