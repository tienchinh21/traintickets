# Schema 07 - Seat holds

Phase này xử lý giữ ghế tạm thời. Đây là phần quan trọng nhất để tránh bán trùng ghế.

## Bảng `seat_holds`

Đại diện một phiên giữ ghế của khách.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `hold_code` | VARCHAR(50) | Có | Mã giữ ghế duy nhất để client tiếp tục booking. |
| `trip_id` | BIGINT UNSIGNED | Có | Chuyến đang giữ ghế. |
| `user_id` | BIGINT UNSIGNED | Không | Khách đang đăng nhập. Null nếu guest checkout. |
| `from_trip_stop_id` | BIGINT UNSIGNED | Có | Điểm đi trên chuyến. |
| `to_trip_stop_id` | BIGINT UNSIGNED | Có | Điểm đến trên chuyến. |
| `contact_email` | VARCHAR(255) | Không | Email liên hệ nếu đã nhập sớm. |
| `contact_phone` | VARCHAR(30) | Không | Số điện thoại liên hệ nếu đã nhập sớm. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `CONFIRMED`, `EXPIRED`, `CANCELLED`. |
| `expires_at` | DATETIME(3) | Có | Thời điểm giữ ghế hết hạn. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo hold. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique `hold_code`.
- Index `trip_id`, `status`, `expires_at`.
- Index `user_id`.
- Index `from_trip_stop_id`, `to_trip_stop_id`.

## Bảng `seat_hold_items`

Lưu từng ghế được giữ trong một hold.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `seat_hold_id` | BIGINT UNSIGNED | Có | Phiên giữ ghế sở hữu item này. |
| `seat_id` | BIGINT UNSIGNED | Có | Ghế đang được giữ. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `CONFIRMED`, `EXPIRED`, `CANCELLED`. |
| `created_at` | DATETIME(3) | Có | Thời điểm giữ ghế này. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique composite `seat_hold_id`, `seat_id`.
- Index `seat_id`.
- Index `status`.

## Quy tắc kiểm tra overlap segment

Khi giữ ghế từ stop A đến stop B, hệ thống phải kiểm tra ghế đó không có hold active hoặc ticket active nào có đoạn bị chồng.

Hai đoạn bị chồng nếu:

```txt
existing_from_order < requested_to_order
AND
requested_from_order < existing_to_order
```

Ví dụ:

- Đã bán Hà Nội -> Vinh.
- Có thể bán tiếp Vinh -> Đà Nẵng.
- Không thể bán Thanh Hóa -> Huế nếu đoạn này chồng với Hà Nội -> Vinh.

## Transaction bắt buộc

Luồng giữ ghế phải chạy trong transaction:

1. Lấy `trip_stops` của ga đi/đến.
2. Validate `from.stop_order < to.stop_order`.
3. Lock các ghế theo thứ tự `seat_id` tăng dần.
4. Kiểm tra hold active chưa hết hạn bị overlap.
5. Kiểm tra ticket active bị overlap.
6. Tạo `seat_holds`.
7. Tạo `seat_hold_items`.

Không gọi email, payment hoặc external API trong transaction này.

