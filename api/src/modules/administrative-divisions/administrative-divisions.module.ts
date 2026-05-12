import { Module } from '@nestjs/common';
import { AdministrativeDivisionsController } from './administrative-divisions.controller';
import { AdministrativeDivisionsService } from './administrative-divisions.service';

@Module({
  controllers: [AdministrativeDivisionsController],
  providers: [AdministrativeDivisionsService]
})
export class AdministrativeDivisionsModule {}
