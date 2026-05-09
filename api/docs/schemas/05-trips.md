# Schema 05 - Trips

Phase này tạo chuyến chạy cụ thể từ route và train. Đây là dữ liệu bắt đầu cho tìm vé và bán vé.

## Bảng `trips`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `route_id` | BIGINT UNSIGNED | Có | Tuyến mẫu của chuyến. |
| `train_id` | BIGINT UNSIGNED | Có | Tàu được dùng cho chuyến. |
| `code` | VARCHAR(50) | Có | Mã chuyến duy nhất, ví dụ `SE1-20260601`. |
| `service_date` | DATE | Có | Ngày vận hành chính của chuyến. |
| `status` | ENUM | Có | Trạng thái: `DRAFT`, `OPEN`, `CLOSED`, `CANCELLED`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique `code`.
- Index `route_id`, `service_date`.
- Index `train_id`, `service_date`.
- Index `status`.

## Bảng `trip_stops`

Lưu giờ đến/rời thực tế theo từng ga của một chuyến cụ thể.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `trip_id` | BIGINT UNSIGNED | Có | Chuyến sở hữu điểm dừng này. |
| `station_id` | BIGINT UNSIGNED | Có | Ga dừng. |
| `stop_order` | INT UNSIGNED | Có | Thứ tự ga trên chuyến. |
| `scheduled_arrival_at` | DATETIME(3) | Không | Thời gian dự kiến tàu đến ga. Null với ga đầu nếu không cần. |
| `scheduled_departure_at` | DATETIME(3) | Không | Thời gian dự kiến tàu rời ga. Null với ga cuối nếu không cần. |
| `actual_arrival_at` | DATETIME(3) | Không | Thời gian thực tế tàu đến ga, dùng sau MVP. |
| `actual_departure_at` | DATETIME(3) | Không | Thời gian thực tế tàu rời ga, dùng sau MVP. |
| `distance_from_start_km` | DECIMAL(8, 2) | Có | Khoảng cách từ ga đầu chuyến đến ga này. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique composite `trip_id`, `stop_order`.
- Unique composite `trip_id`, `station_id`.
- Index `station_id`.
- Index `scheduled_departure_at`.
- Index `scheduled_arrival_at`.

## API tối thiểu cho phase

- `POST /trips`: tạo chuyến từ route và train.
- `GET /trips`: danh sách chuyến.
- `GET /trips/:id`: chi tiết chuyến kèm stops.
- `PATCH /trips/:id`: cập nhật trạng thái hoặc thông tin chuyến.
- `POST /trips/search`: tìm chuyến theo ga đi, ga đến, ngày.

## Validation nghiệp vụ

- Chỉ bán vé khi `trips.status = OPEN`.
- Ga đi phải có `stop_order` nhỏ hơn ga đến.
- `scheduled_departure_at` và `scheduled_arrival_at` phải tăng dần theo thứ tự ga.
- Không cho sửa route/train của trip nếu đã có booking hoặc hold active.

