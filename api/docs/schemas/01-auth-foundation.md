# Schema 01 - Auth foundation

Phase này tạo nền người dùng, role, refresh token và audit log. Các module sau sẽ dùng lại để bảo vệ API CMS.

## Bảng `users`

Lưu tài khoản khách hàng và nhân viên.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `email` | VARCHAR(255) | Không | Email đăng nhập hoặc nhận vé. Cho phép null nếu tài khoản dùng số điện thoại. |
| `phone` | VARCHAR(30) | Không | Số điện thoại đăng nhập hoặc nhận thông báo. |
| `password_hash` | VARCHAR(255) | Không | Mật khẩu đã hash. Null với tài khoản social login hoặc guest chưa tạo mật khẩu. |
| `full_name` | VARCHAR(255) | Có | Họ tên hiển thị của người dùng. |
| `user_type` | ENUM | Có | Loại người dùng: `CUSTOMER`, `STAFF`, `SYSTEM`. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`, `LOCKED`. |
| `last_login_at` | DATETIME(3) | Không | Thời điểm đăng nhập gần nhất. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |
| `deleted_at` | DATETIME(3) | Không | Thời điểm xóa mềm. |

Index/unique đề xuất:

- Unique `email` nếu `email` khác null.
- Unique `phone` nếu `phone` khác null.
- Index `user_type`.
- Index `status`.

Ghi chú MySQL: MySQL cho phép nhiều giá trị null trong unique index, phù hợp với email/phone nullable.

## Bảng `roles`

Lưu nhóm quyền cấp cao cho MVP.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `code` | VARCHAR(50) | Có | Mã role, ví dụ `SUPER_ADMIN`, `OPERATOR`, `CUSTOMER`. |
| `name` | VARCHAR(100) | Có | Tên hiển thị của role. |
| `description` | VARCHAR(500) | Không | Mô tả role dùng để làm gì. |
| `status` | ENUM | Có | Trạng thái: `ACTIVE`, `INACTIVE`. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo bản ghi. |
| `updated_at` | DATETIME(3) | Có | Thời điểm cập nhật gần nhất. |

Index/unique đề xuất:

- Unique `code`.
- Index `status`.

## Bảng `user_roles`

Bảng trung gian gán nhiều role cho một user.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `user_id` | BIGINT UNSIGNED | Có | Liên kết tới `users.id`. |
| `role_id` | BIGINT UNSIGNED | Có | Liên kết tới `roles.id`. |
| `created_at` | DATETIME(3) | Có | Thời điểm gán role. |

Index/unique đề xuất:

- Unique composite `user_id`, `role_id`.
- Index `role_id`.

## Bảng `refresh_tokens`

Lưu refresh token đã hash để quản lý phiên đăng nhập.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `user_id` | BIGINT UNSIGNED | Có | Người dùng sở hữu token. |
| `token_hash` | VARCHAR(255) | Có | Refresh token đã hash, không lưu token thô. |
| `device_name` | VARCHAR(255) | Không | Tên thiết bị hoặc trình duyệt. |
| `ip_address` | VARCHAR(45) | Không | IP đăng nhập, hỗ trợ IPv4/IPv6. |
| `user_agent` | VARCHAR(1000) | Không | User agent của trình duyệt/app. |
| `expires_at` | DATETIME(3) | Có | Thời điểm token hết hạn. |
| `revoked_at` | DATETIME(3) | Không | Thời điểm token bị thu hồi. |
| `created_at` | DATETIME(3) | Có | Thời điểm tạo token. |

Index/unique đề xuất:

- Unique `token_hash`.
- Index `user_id`.
- Index `expires_at`.

## Bảng `audit_logs`

Lưu lịch sử thao tác quan trọng, đặc biệt từ CMS.

| Trường | Kiểu MySQL | Bắt buộc | Giải thích |
|---|---:|---:|---|
| `id` | BIGINT UNSIGNED | Có | Khóa chính, tự tăng. |
| `actor_user_id` | BIGINT UNSIGNED | Không | Người thực hiện thao tác. Null nếu do hệ thống tự chạy. |
| `action` | VARCHAR(100) | Có | Mã hành động, ví dụ `CREATE_STATION`, `CANCEL_BOOKING`. |
| `entity_type` | VARCHAR(100) | Có | Loại đối tượng bị tác động, ví dụ `Station`, `Booking`. |
| `entity_id` | VARCHAR(100) | Không | ID đối tượng bị tác động. Dùng string để linh hoạt. |
| `before_json` | JSON | Không | Dữ liệu trước khi thay đổi. |
| `after_json` | JSON | Không | Dữ liệu sau khi thay đổi. |
| `ip_address` | VARCHAR(45) | Không | IP của người thao tác. |
| `user_agent` | VARCHAR(1000) | Không | User agent của người thao tác. |
| `created_at` | DATETIME(3) | Có | Thời điểm ghi log. |

Index đề xuất:

- Index `actor_user_id`.
- Index `action`.
- Index `entity_type`, `entity_id`.
- Index `created_at`.

