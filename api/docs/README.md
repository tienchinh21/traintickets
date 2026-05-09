# Tài liệu Backend API - Hệ thống bán vé tàu hỏa

Tài liệu này mô tả cách xây dựng backend NestJS dùng MySQL theo từng phase. Mục tiêu là làm đến đâu kiểm soát được schema, module, API và nghiệp vụ đến đó.

## Nguyên tắc triển khai

- Làm theo thứ tự phụ thuộc dữ liệu, không tạo toàn bộ hệ thống một lúc.
- Mỗi phase phải có migration, module, service, controller, validation DTO và test cơ bản.
- MySQL là nguồn dữ liệu chính cho nghiệp vụ.
- Redis/BullMQ chỉ dùng cho queue, cache, TTL hỗ trợ; không thay thế dữ liệu nghiệp vụ quan trọng trong MySQL.
- Không dùng `synchronize: true` ở môi trường production.
- Các bảng nghiệp vụ quan trọng dùng soft delete hoặc status, hạn chế hard delete.
- Mọi thao tác admin quan trọng cần ghi `audit_logs`.

## Thứ tự tài liệu

1. [Setup cấu trúc source](./phases/00-setup-src.md)
2. [Auth foundation schema](./schemas/01-auth-foundation.md)
3. [Station schema](./schemas/02-stations.md)
4. [Route schema](./schemas/03-routes.md)
5. [Train, carriage, seat schema](./schemas/04-trains-carriages-seats.md)
6. [Trip schema](./schemas/05-trips.md)
7. [Fare schema](./schemas/06-fares.md)
8. [Seat hold schema](./schemas/07-seat-holds.md)
9. [Booking schema](./schemas/08-bookings.md)
10. [Payment schema](./schemas/09-payments.md)
11. [Ticket schema](./schemas/10-tickets.md)
12. [Queue và notification schema](./schemas/11-queue-notifications.md)

## MVP backend cần đạt

- Admin đăng nhập và phân quyền cơ bản.
- Quản lý ga, tuyến, điểm dừng, tàu, toa, ghế.
- Tạo chuyến chạy từ tuyến và tàu.
- Tìm chuyến theo ga đi, ga đến, ngày đi.
- Giữ ghế tạm thời theo đoạn hành trình.
- Tạo booking từ ghế đã giữ.
- Thanh toán qua payment simulator trước, sau đó thay bằng cổng thanh toán thật.
- Phát hành vé có mã QR.
- Tra cứu booking/vé.
- Queue xử lý hết hạn giữ ghế, hết hạn booking, gửi thông báo.

