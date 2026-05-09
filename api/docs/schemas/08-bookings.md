# Schema 08 - Bookings

Phase này tạo booking từ ghế đã giữ và lưu thông tin hành khách.

## Bảng `bookings`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `booking_code` | VARCHAR(50) | Có | Mã đặt chỗ duy nhất để tra cứu. |
| `user_id` | BIGINT UNSIGNED | Không | Khách hàng đăng nhập. Null nếu guest checkout. |
| `trip_id` | BIGINT UNSIGNED | Có | Chuyến của booking. |
| `seat_hold_id` | BIGINT UNSIGNED | Có | Phiên giữ ghế được dùng để tạo booking. |
| `from_trip_stop_id` | BIGINT UNSIGNED | Có | Ga đi của booking trên chuyến. |
| `to_trip_stop_id` | BIGINT UNSIGNED | Có | Ga đến của booking trên chuyến. |
| `contact_name` | VARCHAR(255) | Có | Tên người liên hệ. |
| `contact_email` | VARCHAR(255) | Không | Email nhận vé/thông báo. |
| `contact_phone` | VARCHAR(30) | Có | Số điện thoại nhận vé/thông báo. |
| `status` | ENUM | Có | Trạng thái: `PENDING_PAYMENT`, `PAID`, `EXPIRED`, `CANCELLED`. |
| `subtotal_amount` | DECIMAL(12, 2) | Có | Tổng tiền vé trước giảm giá và phí. |
| `discount_amount` | DECIMAL(12, 2) | Có | Tổng số tiền giảm giá. MVP có thể luôn là 0. |
| `fee_amount` | DECIMAL(12, 2) | Có | Tổng phụ phí. MVP có thể luôn là 0. |
| `total_amount` | DECIMAL(12, 2) | Có | Tổng tiền khách cần thanh toán. |
| `currency` | CHAR(3) | Có | Mã tiền tệ, mặc định `VND`. |
| `expires_at` | DATETIME(3) | Có | Thời điểm booking chờ thanh toán hết hạn. |
| `paid_at` | DATETIME(3) | Không | Thời điểm thanh toán thành công. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo booking. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique `booking_code`.
- Unique `seat_hold_id`.
- Index `user_id`.
- Index `trip_id`, `status`.
- Index `contact_phone`.
- Index `expires_at`.

## Bảng `booking_passengers`

Lưu hành khách đi tàu.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `booking_id` | BIGINT UNSIGNED | Có | Booking sở hữu hành khách. |
| `full_name` | VARCHAR(255) | Có | Họ tên hành khách. |
| `document_type` | ENUM | Không | Loại giấy tờ: `CCCD`, `PASSPORT`, `BIRTH_CERTIFICATE`, `OTHER`. |
| `document_number` | VARCHAR(100) | Không | Số giấy tờ tùy thân. |
| `passenger_type` | ENUM | Có | Loại hành khách: `ADULT`, `CHILD`, `STUDENT`, `SENIOR`. |
| `date_of_birth` | DATE | Không | Ngày sinh, dùng cho chính sách giá sau MVP. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index đề xuất:

- Index `booking_id`.
- Index `document_number`.

## Bảng `booking_items`

Lưu từng vé dự kiến trong booking, gắn hành khách với ghế và snapshot giá.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `booking_id` | BIGINT UNSIGNED | Có | Booking sở hữu item. |
| `passenger_id` | BIGINT UNSIGNED | Có | Hành khách đi ghế này. |
| `seat_id` | BIGINT UNSIGNED | Có | Ghế được đặt. |
| `seat_type_id` | BIGINT UNSIGNED | Có | Loại ghế tại thời điểm đặt. |
| `base_price` | DECIMAL(12, 2) | Có | Giá gốc của item. |
| `discount_amount` | DECIMAL(12, 2) | Có | Giảm giá của item. |
| `fee_amount` | DECIMAL(12, 2) | Có | Phụ phí của item. |
| `final_price` | DECIMAL(12, 2) | Có | Giá cuối cùng của item. |
| `status` | ENUM | Có | Trạng thái: `PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo item. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Index `booking_id`.
- Index `passenger_id`.
- Index `seat_id`.

