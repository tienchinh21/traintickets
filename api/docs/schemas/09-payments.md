# Schema 09 - Payments

Phase này xử lý thanh toán. MVP nên bắt đầu bằng payment simulator, sau đó thay bằng VNPay, MoMo, PayOS hoặc Stripe.

## Bảng `payments`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `booking_id` | BIGINT UNSIGNED | Có | Booking cần thanh toán. |
| `provider` | VARCHAR(50) | Có | Nhà cung cấp thanh toán, ví dụ `SIMULATOR`, `VNPAY`, `MOMO`, `PAYOS`. |
| `provider_transaction_id` | VARCHAR(255) | Không | Mã giao dịch từ provider. Có thể null trước khi provider trả về. |
| `amount` | DECIMAL(12, 2) | Có | Số tiền cần thanh toán. |
| `currency` | CHAR(3) | Có | Mã tiền tệ, mặc định `VND`. |
| `status` | ENUM | Có | Trạng thái: `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `EXPIRED`. |
| `payment_url` | VARCHAR(1000) | Không | URL để khách chuyển sang trang thanh toán. |
| `provider_payload_json` | JSON | Không | Dữ liệu provider trả về khi tạo payment. |
| `paid_at` | DATETIME(3) | Không | Thời điểm thanh toán thành công. |
| `expires_at` | DATETIME(3) | Không | Thời điểm payment hết hạn. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo payment. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Index `booking_id`.
- Unique composite `provider`, `provider_transaction_id` nếu `provider_transaction_id` khác null.
- Index `status`.
- Index `expires_at`.

## Bảng `payment_events`

Lưu webhook/callback/raw event để idempotency và debug.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `payment_id` | BIGINT UNSIGNED | Không | Payment liên quan nếu đã map được. |
| `provider` | VARCHAR(50) | Có | Nhà cung cấp gửi event. |
| `event_id` | VARCHAR(255) | Không | ID event từ provider nếu có. |
| `event_type` | VARCHAR(100) | Có | Loại event, ví dụ `PAYMENT_SUCCEEDED`. |
| `payload_json` | JSON | Có | Payload gốc từ provider. |
| `status` | ENUM | Có | Trạng thái xử lý: `RECEIVED`, `PROCESSED`, `FAILED`, `IGNORED`. |
| `received_at` | DATETIME(3) | Có | Thời điểm nhận event. |
| `processed_at` | DATETIME(3) | Không | Thời điểm xử lý xong event. |
| `error_message` | VARCHAR(1000) | Không | Lỗi xử lý event nếu có. |

Index/unique đề xuất:

- Unique composite `provider`, `event_id` nếu `event_id` khác null.
- Index `payment_id`.
- Index `status`.
- Index `received_at`.

## Quy tắc quan trọng

- Không tin frontend để xác nhận thanh toán.
- Webhook phải idempotent, nhận lặp không được phát hành vé lặp.
- Khi payment success, cập nhật booking và phát hành ticket trong transaction.
- Nếu provider không có webhook ổn định, cần job đối soát payment pending.

