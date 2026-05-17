import { Module } from '@nestjs/common';
import { ClientTripsController } from './client-trips.controller';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  controllers: [TripsController, ClientTripsController],
  providers: [TripsService]
})
export class TripsModule {}
