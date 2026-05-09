# Schema 02 - Stations

Phase này quản lý ga tàu. Đây là dữ liệu nền cho tuyến, chuyến và tìm vé.

## Bảng `stations`

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `code` | VARCHAR(20) | Có | Mã ga duy nhất, ví dụ `HAN`, `VIN`, `DAD`. |
| `name` | VARCHAR(255) | Có | Tên ga hiển thị cho khách và admin. |
| `slug` | VARCHAR(255) | Có | Chuỗi thân thiện URL, ví dụ `ga-ha-noi`. |
| `city` | VARCHAR(100) | Không | Tỉnh/thành phố của ga. |
| `address` | VARCHAR(500) | Không | Địa chỉ chi tiết. |
| `latitude` | DECIMAL(10, 7) | Không | Vĩ độ để hiển thị bản đồ hoặc tính vị trí. |
| `longitude` | DECIMAL(10, 7) | Không | Kinh độ để hiển thị bản đồ hoặc tính vị trí. |
| `timezone` | VARCHAR(50) | Có | Múi giờ của ga, mặc định `Asia/Ho_Chi_Minh`. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`. Ga inactive không dùng để bán vé mới. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique `code`.
- Unique `slug`.
- Index `name`.
- Index `city`.
- Index `status`.

## API tối thiểu cho phase

- `POST /stations`: tạo ga.
- `GET /stations`: danh sách ga, có tìm kiếm theo tên/code.
- `GET /stations/:id`: chi tiết ga.
- `PATCH /stations/:id`: cập nhật ga.
- `DELETE /stations/:id`: xóa mềm ga.

## Validation nghiệp vụ

- `code` phải viết hoa, không dấu, không khoảng trắng.
- Không cho xóa ga nếu đang được dùng trong route active.
- Không cho đổi `code` nếu ga đã phát sinh chuyến, trừ khi admin cấp cao xác nhận.

