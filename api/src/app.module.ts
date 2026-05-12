import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import queueConfig from './config/queue.config';
import redisConfig from './config/redis.config';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AdministrativeDivisionsModule } from './modules/administrative-divisions/administrative-divisions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StationsModule } from './modules/stations/stations.module';
import { TrainsModule } from './modules/trains/trains.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, queueConfig]
    }),
    PrismaModule,
    HealthModule,
    AdministrativeDivisionsModule,
    UsersModule,
    AuthModule,
    AuditLogsModule,
    RolesModule,
    PermissionsModule,
    StationsModule,
    RoutesModule,
    TrainsModule
  ]
})
export class AppModule {}
