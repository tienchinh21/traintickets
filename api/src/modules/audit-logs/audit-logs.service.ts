import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: dto.actorUserId,
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        beforeJson: dto.beforeJson,
        afterJson: dto.afterJson,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent
      }
    });
  }

  findByActor(actorUserId: string) {
    return this.prisma.auditLog.findMany({
      where: { actorUserId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  findByEntity(entityType: string, entityId?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
