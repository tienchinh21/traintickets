# Schema 10 - Tickets

Phase này phát hành vé sau khi thanh toán thành công.

## Bảng `tickets`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `ticket_code` | VARCHAR(50) | Có | Mã vé duy nhất. |
| `booking_id` | BIGINT UNSIGNED | Có | Booking phát sinh vé. |
| `booking_item_id` | BIGINT UNSIGNED | Có | Item trong booking tương ứng với vé này. |
| `passenger_id` | BIGINT UNSIGNED | Có | Hành khách sở hữu vé. |
| `trip_id` | BIGINT UNSIGNED | Có | Chuyến đi của vé. |
| `seat_id` | BIGINT UNSIGNED | Có | Ghế của vé. |
| `from_trip_stop_id` | BIGINT UNSIGNED | Có | Ga đi của vé. |
| `to_trip_stop_id` | BIGINT UNSIGNED | Có | Ga đến của vé. |
| `qr_token` | VARCHAR(255) | Có | Token dùng để tạo QR code. Không nên chứa toàn bộ dữ liệu nhạy cảm. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `USED`, `CANCELLED`, `REFUNDED`. |
| `issued_at` | DATETIME(3) | Có | Thời điểm phát hành vé. |
| `used_at` | DATETIME(3) | Không | Thời điểm soát vé thành công. |
| `cancelled_at` | DATETIME(3) | Không | Thời điểm hủy vé. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique `ticket_code`.
- Unique `booking_item_id`.
- Unique `qr_token`.
- Index `booking_id`.
- Index `trip_id`, `seat_id`.
- Index `status`.

## Bảng `ticket_events`

Lưu lịch sử thay đổi trạng thái vé.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `ticket_id` | BIGINT UNSIGNED | Có | Vé phát sinh event. |
| `event_type` | VARCHAR(100) | Có | Loại event, ví dụ `ISSUED`, `USED`, `CANCELLED`. |
| `actor_user_id` | BIGINT UNSIGNED | Không | Người thực hiện event. Null nếu do hệ thống. |
| `metadata_json` | JSON | Không | Dữ liệu bổ sung của event. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo event. |

Index đề xuất:

- Index `ticket_id`.
- Index `event_type`.
- Index `created_at`.

## Quy tắc phát hành vé

- Mỗi `booking_item` chỉ phát hành một ticket active.
- Không phát hành vé nếu booking chưa `PAID`.
- QR token nên là chuỗi random hoặc signed token, không phải JSON thông tin khách.
- Soát vé MVP có thể chỉ đổi trạng thái từ `ACTIVE` sang `USED`.

