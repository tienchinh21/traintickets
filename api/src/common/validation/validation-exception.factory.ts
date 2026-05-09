import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppException } from '../exceptions/app.exception';

const FIELD_LABELS: Record<string, string> = {
  code: 'Mã',
  name: 'Tên',
  fullName: 'Họ tên',
  email: 'Email',
  phone: 'Số điện thoại',
  password: 'Mật khẩu',
  identifier: 'Thông tin đăng nhập',
  refreshToken: 'Refresh token',
  carriageType: 'Loại toa',
  carriageNumber: 'Số toa',
  seatNumber: 'Số ghế',
  seatTypeId: 'Loại ghế',
  allowedCarriageTypes: 'Danh sách loại toa được phép',
  baseMultiplier: 'Hệ số giá',
  stops: 'Danh sách ga dừng',
  stationId: 'Ga',
  stopOrder: 'Thứ tự ga dừng',
  distanceFromStartKm: 'Khoảng cách từ ga đầu',
  status: 'Trạng thái'
};

export function createValidationException(errors: ValidationError[]) {
  if (hasConstraint(errors, 'carriageType', 'isEnum')) {
    return new AppException(
      'CARRIAGE_TYPE_INVALID',
      'Loại toa không hợp lệ',
      HttpStatus.BAD_REQUEST,
      ['Loại toa phải là SEAT, SLEEPER hoặc VIP']
    );
  }

  return new AppException(
    'VALIDATION_ERROR',
    'Dữ liệu không hợp lệ',
    HttpStatus.BAD_REQUEST,
    flattenValidationErrors(errors)
  );
}

function hasConstraint(
  errors: ValidationError[],
  property: string,
  constraint: string
): boolean {
  return errors.some(
    (error) =>
      (error.property === property &&
        Boolean(error.constraints?.[constraint])) ||
      hasConstraint(error.children ?? [], property, constraint)
  );
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath?: string
): string[] {
  return errors.flatMap((error) => {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const details = Object.entries(error.constraints ?? {}).map(
      ([constraint, defaultMessage]) =>
        buildValidationMessage(error.property, constraint, defaultMessage)
    );

    return [
      ...details,
      ...flattenValidationErrors(error.children ?? [], propertyPath)
    ];
  });
}

function buildValidationMessage(
  property: string,
  constraint: string,
  defaultMessage: string
) {
  const label = FIELD_LABELS[property] ?? property;

  if (property === 'carriageType' && constraint === 'isEnum') {
    return 'Loại toa phải là SEAT, SLEEPER hoặc VIP';
  }

  if (constraint === 'isNotEmpty' || constraint === 'arrayNotEmpty') {
    return `${label} không được để trống`;
  }

  if (constraint === 'isEnum') {
    return `${label} không hợp lệ`;
  }

  if (constraint === 'isUUID') {
    return `${label} phải là UUID hợp lệ`;
  }

  if (constraint === 'isInt') {
    return `${label} phải là số nguyên`;
  }

  if (constraint === 'min') {
    return `${label} phải lớn hơn hoặc bằng giá trị tối thiểu`;
  }

  if (constraint === 'max') {
    return `${label} vượt quá giá trị tối đa`;
  }

  if (constraint === 'maxLength') {
    return `${label} vượt quá độ dài cho phép`;
  }

  if (constraint === 'matches') {
    return `${label} không đúng định dạng`;
  }

  if (constraint === 'isString') {
    return `${label} phải là chuỗi`;
  }

  if (constraint === 'isNumber') {
    return `${label} phải là số`;
  }

  if (constraint === 'isArray') {
    return `${label} phải là danh sách`;
  }

  if (constraint === 'isObject') {
    return `${label} phải là object JSON hợp lệ`;
  }

  return defaultMessage;
}
