import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || accessSecret === 'change_me') {
    throw new Error(
      'JWT_ACCESS_SECRET chưa được cấu hình hoặc đang dùng giá trị mặc định. Vui lòng set biến môi trường JWT_ACCESS_SECRET.'
    );
  }

  if (!refreshSecret || refreshSecret === 'change_me') {
    throw new Error(
      'JWT_REFRESH_SECRET chưa được cấu hình hoặc đang dùng giá trị mặc định. Vui lòng set biến môi trường JWT_REFRESH_SECRET.'
    );
  }

  return {
    accessSecret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d'
  };
});
