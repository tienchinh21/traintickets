# Schema 03 - Routes

Phase này quản lý tuyến đường và thứ tự các ga dừng trên tuyến.

## Bảng `routes`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `code` | VARCHAR(30) | Có | Mã tuyến duy nhất, ví dụ `HN-DN`, `HN-SG`. |
| `name` | VARCHAR(255) | Có | Tên tuyến, ví dụ `Hà Nội - Đà Nẵng`. |
| `description` | VARCHAR(1000) | Không | Mô tả tuyến cho admin hoặc SEO sau này. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique `code`.
- Index `status`.

## Bảng `route_stops`

Lưu danh sách ga dừng theo thứ tự trên một tuyến mẫu.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `route_id` | BIGINT UNSIGNED | Có | Tuyến sở hữu điểm dừng này. |
| `station_id` | BIGINT UNSIGNED | Có | Ga tại điểm dừng. |
| `stop_order` | INT UNSIGNED | Có | Thứ tự ga trên tuyến, bắt đầu từ 1. |
| `distance_from_start_km` | DECIMAL(8, 2) | Có | Khoảng cách từ ga đầu tuyến đến ga này, dùng để tính giá. |
| `default_arrival_offset_minutes` | INT UNSIGNED | Không | Số phút dự kiến từ ga đầu đến lúc tàu đến ga này. Null với ga đầu. |
| `default_departure_offset_minutes` | INT UNSIGNED | Không | Số phút dự kiến từ ga đầu đến lúc tàu rời ga này. Null với ga cuối nếu không cần. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique composite `route_id`, `stop_order`.
- Unique composite `route_id`, `station_id`.
- Index `station_id`.

## Validation nghiệp vụ

- Một route phải có ít nhất 2 ga.
- `stop_order` không được trùng trong cùng route.
- `distance_from_start_km` phải tăng dần theo `stop_order`.
- Không cho xóa route active nếu đã có trip đang mở bán.

