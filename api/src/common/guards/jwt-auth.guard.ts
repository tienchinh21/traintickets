import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppException } from '../exceptions/app.exception';

export type AuthenticatedUser = {
  sub: string;
  email?: string | null;
  phone?: string | null;
  userType: string;
};

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Thiếu access token');
    }

    try {
      request.user = await this.jwtService.verifyAsync<AuthenticatedUser>(
        token,
        {
          secret: this.configService.get<string>('jwt.accessSecret')
        }
      );
    } catch (error) {
      const isExpired = this.isTokenExpired(error);
      throw new AppException(
        isExpired ? 'AUTH_TOKEN_EXPIRED' : 'UNAUTHORIZED',
        isExpired ? 'Phiên đăng nhập đã hết hạn' : 'Access token không hợp lệ',
        401,
        [isExpired ? 'Access token đã hết hạn' : 'Access token không hợp lệ']
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private isTokenExpired(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'TokenExpiredError'
    );
  }
}
