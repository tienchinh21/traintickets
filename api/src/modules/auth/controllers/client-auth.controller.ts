import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { RegisterDto } from '../dto/register.dto';

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

@ApiTags('client-auth')
@Controller('client/auth')
export class ClientAuthController {
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
    return this.authService.registerCustomer(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập ứng dụng khách hàng',
    description:
      'Đăng nhập bằng email hoặc số điện thoại cho tài khoản CUSTOMER. Tài khoản nội bộ không được phép đăng nhập API client.'
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Đăng nhập thành công, trả access token + refresh token.'
  })
  @ApiUnauthorizedResponse({ description: 'Thông tin đăng nhập không hợp lệ.' })
  @ApiForbiddenResponse({
    description: 'Tài khoản không được phép truy cập API client.'
  })
  login(@Body() dto: LoginDto) {
    return this.authService.loginCustomer(dto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Làm mới token khách hàng',
    description:
      'Thu hồi refresh token cũ nếu còn hiệu lực và cấp cặp token mới cho tài khoản CUSTOMER.'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'Refresh token hợp lệ, trả token mới.' })
  @ApiUnauthorizedResponse({
    description: 'Refresh token không hợp lệ hoặc đã hết hạn.'
  })
  @ApiForbiddenResponse({
    description: 'Refresh token không thuộc tài khoản khách hàng.'
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshCustomer(dto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Đăng xuất khách hàng',
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
    summary: 'Lấy thông tin khách hàng hiện tại',
    description:
      'Đọc user từ Bearer access token và chỉ trả profile cho tài khoản CUSTOMER.'
  })
  @ApiOkResponse({ description: 'Thông tin user hiện tại.' })
  @ApiUnauthorizedResponse({
    description: 'Thiếu token hoặc token không hợp lệ.'
  })
  @ApiForbiddenResponse({
    description: 'Tài khoản không được phép truy cập hồ sơ client.'
  })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.meCustomer(request.user.sub);
  }
}
