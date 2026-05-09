# Schema 06 - Fares

Phase này xử lý giá vé MVP. Giá được tính theo khoảng cách, route và loại ghế.

## Bảng `fare_rules`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `route_id` | BIGINT UNSIGNED | Có | Tuyến áp dụng giá. |
| `seat_type_id` | BIGINT UNSIGNED | Có | Loại ghế áp dụng giá. |
| `base_price_per_km` | DECIMAL(12, 2) | Có | Giá cơ bản trên mỗi km. |
| `min_price` | DECIMAL(12, 2) | Có | Giá tối thiểu cho một vé. |
| `currency` | CHAR(3) | Có | Mã tiền tệ, mặc định `VND`. |
| `effective_from` | DATETIME(3) | Có | Thời điểm bắt đầu hiệu lực. |
| `effective_to` | DATETIME(3) | Không | Thời điểm hết hiệu lực. Null nghĩa là còn hiệu lực vô thời hạn. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Index `route_id`, `seat_type_id`.
- Index `effective_from`, `effective_to`.
- Index `status`.

## Cách tính giá MVP

```txt
distance = to_stop.distance_from_start_km - from_stop.distance_from_start_km
raw_price = distance * fare_rule.base_price_per_km * seat_type.base_multiplier
final_price = max(raw_price, fare_rule.min_price)
```

Khi tạo booking, phải snapshot giá vào `booking_items`. Không tính lại giá từ `fare_rules` khi khách đã giữ ghế và tạo booking.

## Validation nghiệp vụ

- Không cho tạo 2 fare rule active bị chồng thời gian cho cùng `route_id` và `seat_type_id`.
- `base_price_per_km` phải lớn hơn 0.
- `min_price` không được âm.
- `effective_to` phải lớn hơn `effective_from` nếu có.

