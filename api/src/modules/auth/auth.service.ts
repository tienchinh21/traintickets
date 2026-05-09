import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleStatus, UserStatus, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

type TokenPayload = {
  sub: string;
  email?: string | null;
  phone?: string | null;
  userType: UserType;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Email hoặc số điện thoại là bắt buộc');
    }

    const existingUser = await this.usersService.findByEmailOrPhone(
      dto.email,
      dto.phone
    );

    if (existingUser) {
      throw new BadRequestException('Email hoặc số điện thoại đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const customerRole = await this.prisma.role.findUnique({
      where: { code: 'CUSTOMER' }
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash,
        userType: UserType.CUSTOMER,
        status: UserStatus.ACTIVE,
        roles: customerRole
          ? {
              create: {
                roleId: customerRole.id
              }
            }
          : undefined
      }
    });

    return this.issueTokens(user.id);
  }

  async login(dto: LoginDto) {
    const user = await this.findUserForLogin(dto.identifier);

    if (!user?.passwordHash || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    await this.usersService.updateLastLoginAt(user.id);

    return this.issueTokens(user.id);
  }

  async refresh(dto: RefreshTokenDto) {
    const tokenHash = this.hashToken(dto.refreshToken);
    const refreshToken = await this.findActiveRefreshToken(tokenHash);

    if (!refreshToken || refreshToken.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    await this.revokeRefreshToken(tokenHash);

    return this.issueTokens(refreshToken.userId);
  }

  async logout(refreshToken: string) {
    await this.revokeRefreshToken(this.hashToken(refreshToken));

    return {
      message: 'Đăng xuất thành công'
    };
  }

  async me(userId: string) {
    const user = await this.usersService.findAuthProfileById(userId);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return this.toAuthProfile(user);
  }

  findUserForLogin(identifier: string) {
    if (identifier.includes('@')) {
      return this.usersService.findByEmail(identifier);
    }

    return this.usersService.findByPhone(identifier);
  }

  createRefreshToken(dto: CreateRefreshTokenDto) {
    return this.prisma.refreshToken.create({
      data: {
        userId: dto.userId,
        tokenHash: dto.tokenHash,
        deviceName: dto.deviceName,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        expiresAt: dto.expiresAt
      }
    });
  }

  findActiveRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });
  }

  revokeRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.update({
      where: { tokenHash },
      data: {
        revokedAt: new Date()
      }
    });
  }

  revokeUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  private async issueTokens(userId: string) {
    const user = await this.usersService.findAuthProfileById(userId);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const payload = this.toTokenPayload(user);
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn') as never
    });
    const refreshToken = randomBytes(48).toString('base64url');

    await this.createRefreshToken({
      userId: user.id.toString(),
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.resolveRefreshExpiresAt()
    });

    return {
      data: {
        accessToken,
        refreshToken,
        user: this.toAuthProfile(user)
      },
      message: 'Xác thực thành công'
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private resolveRefreshExpiresAt() {
    const expiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '30d';
    const match = /^(?<amount>\d+)(?<unit>[mhd])$/.exec(expiresIn);

    if (!match?.groups) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match.groups.amount);
    const unit = match.groups.unit;
    const multipliers = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    return new Date(
      Date.now() + amount * multipliers[unit as keyof typeof multipliers]
    );
  }

  private toTokenPayload(
    user: Awaited<ReturnType<UsersService['findAuthProfileById']>>
  ): TokenPayload {
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return {
      sub: user.id.toString(),
      email: user.email,
      phone: user.phone,
      userType: user.userType
    };
  }

  private toAuthProfile(
    user: Awaited<ReturnType<UsersService['findAuthProfileById']>>
  ) {
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    const payload = this.toTokenPayload(user);
    const roles = user.roles
      .map((userRole) => userRole.role)
      .filter((role) => role.status === RoleStatus.ACTIVE);
    const permissions = roles.flatMap((role) =>
      role.permissions
        .filter(
          (rolePermission) => rolePermission.permission.status === 'ACTIVE'
        )
        .map((rolePermission) => rolePermission.permission.code)
    );

    return {
      id: payload.sub,
      email: payload.email,
      phone: payload.phone,
      fullName: user.fullName,
      userType: payload.userType,
      roles: roles.map((role) => role.code),
      permissions: [...new Set(permissions)]
    };
  }
}
