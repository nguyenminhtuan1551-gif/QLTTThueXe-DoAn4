# Backend - Hệ Thống Quản Lý Cho Thuê Xe

Backend RESTful API xây dựng theo kiến trúc Express MVC, hỗ trợ xác thực JSON Web Token (JWT) Bearer Token và Session cho cả hai nhóm người dùng: **Khách hàng (Customer)** trên Mobile App và **Quản trị viên / Nhân viên (Admin / Employee)** trên Web Admin.

## Cấu trúc thư mục

- `app.js`: Khởi tạo Express, CORS, logging (Morgan), body parser, static uploads, router tổng.
- `bin/www`: Khởi chạy HTTP server tại cổng cấu hình (`PORT=5000`).
- `common/`: Kết nối MySQL Pool (`db.js`), JWT utils (`jwt.js`), session (`session.js`), upload (`carUpload.js`, `bookingImageUpload.js`), hằng số (`constants.js`), response helper (`response.js`), hash mật khẩu (`password.js`), bộ tạo mã (`generateId.js`).
- `controllers/`: Logic nghiệp vụ theo từng module.
- `models/`: Tương tác cơ sở dữ liệu MySQL với Prepared Statements.
- `routes/`: Định nghĩa API endpoints (`/api/auth`, `/api/cars`, `/api/contracts`, ...).
- `middlewares/`: Xác thực JWT Bearer (`auth.middleware.js`), async wrapper (`asyncHandler.js`), xử lý lỗi tập trung (`error.middleware.js`).
- `database/`: Schema DDL (`schema.sql`) và dữ liệu mẫu (`seed.sql`).
- `uploads/`: Lưu trữ hình ảnh xe và hình ảnh bàn giao / nhận xe.

## Cơ chế Xác thực & Phân quyền (Auth & Roles)

1. **JWT Bearer Token**: Client truyền Token trong Header:
   ```http
   Authorization: Bearer <token>
   ```
2. **2 Cổng đăng nhập phân quyền riêng biệt**:
   - `POST /api/auth/admin/login`: Dành cho Quản trị viên (`Admin`) và Nhân viên (`Nhân viên`), trả về JWT token với `scope: 'admin'`.
   - `POST /api/auth/customers/login`: Dành cho Khách hàng (`Customer`), trả về JWT token với `scope: 'customer'`.
   - `POST /api/auth/customers/register`: Đăng ký tài khoản khách hàng mới.
   - `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại từ Token.
   - `POST /api/auth/logout`: Đăng xuất phiên làm việc.
3. **Các Middleware phân quyền**:
   - `requireAuth`: Yêu cầu phải có token hợp lệ.
   - `requireCustomer`: Yêu cầu quyền Khách hàng (`scope: 'customer'`).
   - `requireRoles('Admin', 'Nhân viên')`: Yêu cầu vai trò cụ thể.
   - `requireAdminOrStaff`: Yêu cầu quyền quản trị viên hoặc nhân viên.

## Hướng dẫn cài đặt & khởi chạy

1. Cài đặt thư viện:
   ```bash
   cd backend
   npm install
   ```

2. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Cấu hình thông tin kết nối MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), `PORT=5000`, `JWT_SECRET`.

3. Import cơ sở dữ liệu:
   ```bash
   mysql -u root -p web_thue_xe < database/schema.sql
   mysql -u root -p web_thue_xe < database/seed.sql
   ```

4. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```
   Server chạy tại `http://localhost:5000`.
