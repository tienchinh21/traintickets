# Schema 11 - Queue và notifications

Phase này xử lý background jobs và log thông báo.

## Queue dùng BullMQ

Không cần tạo bảng MySQL cho job queue vì BullMQ dùng Redis để lưu trạng thái job. Tuy nhiên, các kết quả nghiệp vụ quan trọng vẫn phải lưu MySQL.

Queue MVP đề xuất:

| Queue | Mục đích |
|---|---|
| `seat-hold-expiry` | Hết hạn giữ ghế sau 5-10 phút. |
| `booking-expiry` | Hết hạn booking chờ thanh toán. |
| `payment-reconciliation` | Kiểm tra lại payment pending với provider. |
| `notifications` | Gửi email/SMS/Zalo sau khi phát hành vé. |

## Bảng `notification_logs`

Lưu lịch sử gửi thông báo.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `channel` | ENUM | Có | Kênh gửi: `EMAIL`, `SMS`, `ZALO`, `PUSH`. |
| `recipient` | VARCHAR(255) | Có | Người nhận, ví dụ email hoặc số điện thoại. |
| `template_code` | VARCHAR(100) | Có | Mã template, ví dụ `TICKET_ISSUED`. |
| `subject` | VARCHAR(255) | Không | Tiêu đề email hoặc thông báo. |
| `payload_json` | JSON | Không | Dữ liệu dùng để render template. |
| `provider` | VARCHAR(50) | Không | Nhà cung cấp gửi, ví dụ `SENDGRID`, `AWS_SES`, `TWILIO`. |
| `provider_message_id` | VARCHAR(255) | Không | ID message từ provider. |
| `status` | ENUM | Có | Trạng thái: `PENDING`, `SENT`, `FAILED`, `CANCELLED`. |
| `error_message` | VARCHAR(1000) | Không | Lỗi gửi thông báo nếu có. |
| `sent_at` | DATETIME(3) | Không | Thời điểm gửi thành công. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo log. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index đề xuất:

- Index `channel`, `status`.
- Index `recipient`.
- Index `template_code`.
- Index `created_at`.

## Bull Board

Nên mount dashboard queue ở endpoint nội bộ:

```txt
/admin/queues
```

Endpoint này phải được bảo vệ bằng một trong các cách:

- Admin auth + role `SUPER_ADMIN`.
- Basic auth riêng cho môi trường nội bộ.
- Chỉ mở trong private network/VPN.

