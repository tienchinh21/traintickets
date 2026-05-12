import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { ClientAuthController } from './controllers/client-auth.controller';
import { CmsAuthController } from './controllers/cms-auth.controller';

@Module({
  imports: [JwtModule.register({ global: true }), UsersModule],
  controllers: [CmsAuthController, ClientAuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
