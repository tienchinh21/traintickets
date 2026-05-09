import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details: unknown[] = []
  ) {
    super(
      {
        code,
        message,
        details
      },
      statusCode
    );
  }
}
