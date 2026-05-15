import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuthenticatedUser } from './jwt-auth.guard';

type RequestWithUser = {
  user?: AuthenticatedUser;
};

/**
 * RolesGuard checks user roles from DB at runtime.
 * JWT does NOT contain roles, so we query user_roles -> role.
 * Use @Roles('SUPER_ADMIN', 'OPERATOR') on handlers.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = request.user?.sub;

    if (!userId) {
      return false;
    }

    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        user: {
          deletedAt: null,
          status: 'ACTIVE'
        },
        role: {
          code: {
            in: requiredRoles
          },
          status: 'ACTIVE'
        }
      },
      select: {
        id: true
      }
    });

    return Boolean(userRole);
  }
}
