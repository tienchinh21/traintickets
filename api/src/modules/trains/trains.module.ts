import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { CarriagesController } from './carriages.controller';
import { CarriagesService } from './carriages.service';
import { SeatTypesController } from './seat-types.controller';
import { SeatTypesService } from './seat-types.service';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    TrainsController,
    SeatTypesController,
    CarriagesController,
    SeatsController
  ],
  providers: [TrainsService, SeatTypesService, CarriagesService, SeatsService]
})
export class TrainsModule {}
