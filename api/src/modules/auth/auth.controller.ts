import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  AuthenticatedUser,
  JwtAuthGuard
} from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản khách hàng',
    description:
      'Tạo user CUSTOMER mới bằng email hoặc số điện thoại, hash mật khẩu, gán role CUSTOMER và trả access token + refresh token.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Đăng ký thành công, trả token và thông tin user.'
  })
  @ApiBadRequestResponse({
    description:
      'Thiếu email/số điện thoại hoặc email/số điện thoại đã tồn tại.'
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập hệ thống CMS',
    description:
      'Đăng nhập bằng email hoặc số điện thoại cho tài khoản nội bộ. Tài khoản CUSTOMER không được phép đăng nhập hệ thống CMS. Token chỉ chứa identity; quyền được check runtime từ DB.'
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả access token + refresh token.'
  })
  @ApiUnauthorizedResponse({ description: 'Thông tin đăng nhập không hợp lệ.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Làm mới token',
    description:
      'Thu hồi refresh token cũ nếu còn hiệu lực và cấp cặp access token + refresh token mới.'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Refresh token hợp lệ, trả token mới.' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.'
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Đăng xuất',
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
    summary: 'Lấy thông tin người dùng hiện tại',
    description:
      'Đọc user từ Bearer access token và trả profile kèm roles/permissions hiện tại trong DB.'
  })
  @ApiOkResponse({ description: 'Thông tin user hiện tại.' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ.'
  })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(request.user.sub);
  }
}
