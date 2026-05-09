# Schema 04 - Trains, carriages, seats

Phase này quản lý cấu hình tàu vật lý: tàu, toa, loại ghế và ghế.

## Bảng `trains`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `code` | VARCHAR(30) | Có | Mã tàu duy nhất, ví dụ `SE1`, `TN2`. |
| `name` | VARCHAR(255) | Có | Tên tàu hiển thị. |
| `description` | VARCHAR(1000) | Không | Ghi chú cấu hình hoặc mô tả tàu. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `MAINTENANCE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique `code`.
- Index `status`.

## Bảng `seat_types`

Lưu loại ghế/giường để tính giá và hiển thị.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `code` | VARCHAR(30) | Có | Mã loại ghế, ví dụ `SOFT_SEAT`, `SLEEPER_4`. |
| `name` | VARCHAR(100) | Có | Tên loại ghế hiển thị. |
| `description` | VARCHAR(500) | Không | Mô tả tiện ích hoặc điều kiện loại ghế. |
| `base_multiplier` | DECIMAL(5, 2) | Có | Hệ số nhân giá so với giá cơ bản. Ví dụ 1.2 cho ghế tốt hơn. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique `code`.
- Index `status`.

## Bảng `carriages`

Lưu toa thuộc một tàu.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `train_id` | BIGINT UNSIGNED | Có | Tàu sở hữu toa này. |
| `carriage_number` | INT UNSIGNED | Có | Số thứ tự toa trên tàu. |
| `name` | VARCHAR(100) | Có | Tên toa hiển thị, ví dụ `Toa 1`. |
| `carriage_type` | VARCHAR(50) | Có | Loại toa, ví dụ `SEAT`, `SLEEPER`, `VIP`. |
| `seat_map_layout` | JSON | Không | Cấu hình layout ghế để CMS/Client render sơ đồ toa. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `MAINTENANCE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique composite `train_id`, `carriage_number`.
- Index `train_id`.
- Index `status`.

## Bảng `seats`

Lưu từng ghế/giường trong toa.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `carriage_id` | BIGINT UNSIGNED | Có | Toa chứa ghế này. |
| `seat_type_id` | BIGINT UNSIGNED | Có | Loại ghế dùng để tính giá. |
| `seat_number` | VARCHAR(20) | Có | Mã ghế trong toa, ví dụ `A1`, `01`, `B12`. |
| `row_number` | INT UNSIGNED | Không | Dòng hiển thị trên sơ đồ ghế. |
| `column_number` | INT UNSIGNED | Không | Cột hiển thị trên sơ đồ ghế. |
| `floor_number` | INT UNSIGNED | Không | Tầng giường nằm nếu có. |
| `status` | ENUM | Có | Trạng thái cấu hình: `ACTIVE`, `BROKEN`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique composite `carriage_id`, `seat_number`.
- Index `seat_type_id`.
- Index `status`.

## Validation nghiệp vụ

- Không cho xóa tàu nếu đã có trip tương lai đang mở bán.
- Không cho xóa ghế nếu ghế đã phát sinh ticket.
- Khi tạo trip, snapshot cấu hình tàu hiện tại cần được kiểm soát. MVP có thể dùng trực tiếp `train/carriage/seat`, nhưng khi hệ thống lớn hơn nên có version cấu hình tàu.

