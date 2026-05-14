import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuthenticatedUser } from './jwt-auth.guard';

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    const hasPermission = await this.prisma.userRole.findFirst({
      where: {
        userId,
        user: {
          deletedAt: null,
          status: 'ACTIVE'
        },
        role: {
          status: 'ACTIVE',
          permissions: {
            some: {
              permission: {
                code: {
                  in: requiredPermissions
                },
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      select: {
        id: true
      }
    });

    if (!hasPermission) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    return true;
  }
}
