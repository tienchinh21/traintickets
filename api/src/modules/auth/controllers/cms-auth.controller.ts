import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  AuthenticatedUser,
  JwtAuthGuard
} from '../../../common/guards/jwt-auth.guard';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

@ApiTags('cms-auth')
@Controller('cms/auth')
export class CmsAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập hệ thống CMS',
    description:
      'Đăng nhập bằng email hoặc số điện thoại cho tài khoản nội bộ. Tài khoản CUSTOMER không được phép đăng nhập hệ thống CMS.'
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả access token + refresh token.'
  })
  @ApiUnauthorizedResponse({ description: 'Thông tin đăng nhập không hợp lệ.' })
  @ApiForbiddenResponse({
    description: 'Tài khoản không được phép truy cập hệ thống CMS.'
  })
  login(@Body() dto: LoginDto) {
    return this.authService.loginCms(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Làm mới token CMS',
    description:
      'Thu hồi refresh token cũ nếu còn hiệu lực và cấp cặp token mới cho tài khoản nội bộ.'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Refresh token hợp lệ, trả token mới.' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.'
  })
  @ApiForbiddenResponse({
    description: 'Refresh token không thuộc tài khoản nội bộ.'
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshCms(dto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Đăng xuất CMS',
    description:
      'Thu hồi refresh token hiện tại. Access token sẽ tự hết hạn theo TTL.'
  })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ description: 'Đăng xuất thành công.' })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản CMS hiện tại',
    description:
      'Đọc user từ Bearer access token và chỉ trả profile cho tài khoản nội bộ.'
  })
  @ApiOkResponse({ description: 'Thông tin user hiện tại.' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ.'
  })
  @ApiForbiddenResponse({
    description: 'Tài khoản không được phép truy cập hồ sơ CMS.'
  })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.meCms(request.user.sub);
  }
}
