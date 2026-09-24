# Hệ Thống Quản Lý Cho Thuê Xe (Car Rental Management System)

Dự án phát triển hệ thống cho thuê xe ô tô tự lái và có tài xế tại khu vực Hà Nội theo kiến trúc 3 tầng độc lập (3-tier architecture): **Backend RESTful API** (Node.js/Express + MySQL), **Khách hàng trên Mobile App** (React Native Expo SDK 54 + TypeScript), và **Quản trị viên trên Web Admin** (Next.js 14 App Router + Tailwind CSS).

---

## 🏗️ Cấu Trúc Tổng Thể Dự Án (Repository Structure)

```
QLTTThueXe-DoAn4/
├── backend/                 # Node.js + Express API (MVC, MySQL, JWT + Session)
│   ├── app.js
│   ├── bin/www              # Entrypoint server (Cổng 5000)
│   ├── common/              # DB connection, JWT helper, Password hashing, File upload
│   ├── controllers/         # Auth, Car, Contract, Return, Penalty, Inspection, Maintenance, Report
│   ├── database/            # schema.sql (Bảng dữ liệu) & seed.sql (Dữ liệu ban đầu)
│   ├── middlewares/         # asyncHandler, authMiddleware (JWT Verification & Role Check)
│   ├── models/              # Truy vấn cơ sở dữ liệu MySQL
│   ├── routes/              # Định tuyến API
│   └── uploads/             # Ảnh xe (/uploads/car) và ảnh giấy tờ đặt xe (/uploads/booking)
│
├── mobile-app/              # React Native Mobile App dành cho Khách Hàng (Expo SDK 54 + TypeScript)
│   ├── assets/              # Icons, Splash screen
│   ├── src/
│   │   ├── api/             # Axios Interceptors tự động gắn Bearer Token
│   │   ├── components/      # UI components (Button, Input, CarCard, Header, Badge, Loading)
│   │   ├── constants/       # Theme, Colors, Config tự động tìm IP Metro
│   │   ├── context/         # AuthContext (JWT Storage AsyncStorage, Session sync)
│   │   ├── navigation/      # AuthNavigator, MainTabNavigator (5 Tabs), RootNavigator
│   │   ├── screens/         # Màn hình Mobile:
│   │   │   ├── auth/        # LoginScreen, RegisterScreen
│   │   │   ├── home/        # HomeScreen (Carousel xe nổi bật, Hãng xe, Banner)
│   │   │   ├── cars/        # CarListScreen (Lọc đa tiêu chí), CarDetailScreen (Hạn Đăng kiểm, Lịch bận)
│   │   │   ├── booking/     # BookingScreen (Upload CCCD/GPLX), BookingSuccessScreen (QR & Tài khoản cọc)
│   │   │   ├── rentals/     # MyRentalsScreen (Theo dõi trạng thái), RentalDetailScreen (Biên bản trả & Phạt)
│   │   │   ├── lookup/      # LookupScreen (Tra cứu hợp đồng độc lập không cần login)
│   │   │   └── profile/     # ProfileScreen (Hồ sơ, Sửa giấy tờ, CSKH, Đăng xuất)
│   │   └── types/           # Định nghĩa Types TypeScript
│   ├── App.tsx
│   └── app.json
│
└── web-admin/               # Web Next.js 14 dành cho Quản Trị Viên & Nhân Viên (Tailwind CSS + Recharts)
    ├── src/
    │   ├── app/
    │   │   ├── (admin)/     # Layout Admin bảo vệ bằng JWT & Role
    │   │   │   ├── dashboard/    # KPI Realtime, Biểu đồ Doanh thu 12 tháng, Donut xe, Cảnh báo
    │   │   │   ├── cars/         # Quản lý Đội xe, Thêm/Sửa xe, Upload ảnh xe, Xóa xe
    │   │   │   ├── inspection/   # Quản lý Đăng kiểm xe, Cảnh báo sắp/quá hạn, Cập nhật kỳ kiểm định
    │   │   │   ├── maintenance/  # Quản lý Bảo trì, Tự động chuyển trạng thái xe, Khóa/Mở xe
    │   │   │   ├── contracts/    # Phê duyệt hợp đồng từ App, Gallery ảnh CCCD/Bằng lái, Hợp đồng tại quầy
    │   │   │   ├── returns/      # Lập phiếu trả xe, Tính ngày thực tế, Quyết toán cọc, Chuyển xe 'Sẵn sàng'
    │   │   │   ├── penalties/    # Lập biên bản phạt trả muộn/hỏng hóc gắn phiếu trả xe
    │   │   │   ├── reports/      # Báo cáo Tài chính, Lợi nhuận thuần từng xe, In PDF / Xuất CSV
    │   │   │   ├── customers/    # Danh sách khách hàng, Xem lịch sử toàn bộ các chuyến thuê
    │   │   │   ├── contacts/     # Hộp thư CSKH, Cập nhật trạng thái 'Đã phản hồi'
    │   │   │   ├── employees/    # Quản trị nhân viên, Phân quyền Admin/Staff, Khóa tài khoản
    │   │   │   └── settings/     # Cài đặt thông tin công ty, Ngưỡng cảnh báo đăng kiểm
    │   │   └── login/       # Đăng nhập Cổng Quản Trị (Hỗ trợ cả /auth/login)
    │   ├── components/      # Sidebar (11 modules), Header, StatCard, Badge
    │   ├── context/         # AuthContext (Admin JWT Session)
    │   ├── services/        # 10 Services Axios kết nối Backend API
    │   └── types/           # Định nghĩa Type TypeScript
    └── package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy 3 Phân Hệ (Quick Start)

### 1. Chuẩn bị Cơ sở dữ liệu MySQL
1. Khởi động **MySQL** trên **XAMPP** hoặc **Laragon** (Cổng mặc định `3306`).
2. Mở phpMyAdmin hoặc MySQL Client, tạo database:
   ```sql
   CREATE DATABASE web_thue_xe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import 2 file SQL theo thứ tự:
   - `backend/database/schema.sql` (Cấu trúc bảng)
   - `backend/database/seed.sql` (Dữ liệu mẫu ban đầu)

---

### 2. Khởi chạy Backend (`backend/`)
```bash
cd backend
npm install
# Tạo file môi trường:
cp .env.example .env
# Khởi động server:
npm run dev
```
* API Server lắng nghe tại: **`http://localhost:5000`**

---

### 3. Khởi chạy Web Admin Portal (`web-admin/`)
Mở Terminal mới và chạy:
```bash
cd web-admin
npm install
npm run dev
```
* Mở trình duyệt truy cập: **`http://localhost:3000`**
* **Tài khoản Quản trị viên (Admin)**: `admin@thuexetudong.vn` / Mật khẩu: `123456`
* **Tài khoản Nhân viên điều phối**: `nv1@thuexetudong.vn` / Mật khẩu: `123456`

---

### 4. Khởi chạy Mobile App (`mobile-app/`)
Mở Terminal mới và chạy:
```bash
cd mobile-app
npm install --legacy-peer-deps
npx expo start
```
* **Chạy trên trình duyệt Web**: Bấm phím **`w`**.
* **Chạy trên thiết bị thật**: Mở ứng dụng **Expo Go** trên điện thoại (iOS / Android) và quét mã QR trên màn hình.
* **Tài khoản Khách hàng mẫu**: `khachhang1@gmail.com` / Mật khẩu: `123456` (hoặc bấm **Đăng ký ngay** trên app).

---

## 🔄 Luồng Vận Hành Liên Thông Toàn Hệ Thống (E2E Integration)

1. **Khách hàng (Mobile App)**:
   - Đăng ký / Đăng nhập tài khoản khách hàng.
   - Tìm kiếm xe, lọc loại xe/hãng xe/giá thuê, xem hạn đăng kiểm và các khoảng ngày xe bận.
   - Chọn ngày nhận - trả, tải ảnh chụp CCCD & Bằng lái xe qua Camera/Thư viện ảnh.
   - Gửi yêu cầu đặt xe $\rightarrow$ Nhận mã hợp đồng (MaHD) và thông tin chuyển khoản đặt cọc 30%.
2. **Quản trị viên / Nhân viên (Web Admin)**:
   - Đơn đặt xe lập tức hiển thị tại mục **Hợp đồng thuê xe** (`/contracts`) ở trạng thái `Chờ xác nhận`.
   - Nhân viên kiểm tra chi tiết, xem Gallery ảnh giấy tờ mà khách gửi lên từ app.
   - Bấm **Duyệt Đơn** $\rightarrow$ Hợp đồng chuyển sang `Đang hiệu lực`, hệ thống **tự động chuyển trạng thái của xe sang "Đang thuê"**.
3. **Trả xe & Quyết toán (Web Admin)**:
   - Khách trả xe $\rightarrow$ Nhân viên vào mục **Trả xe & Quyết toán** (`/returns`) chọn hợp đồng để lập phiếu.
   - Ghi nhận hiện trạng xe, hệ thống tự động trừ tiền cọc và tính tiền thanh toán còn lại.
   - Bấm **Hoàn tất trả xe** $\rightarrow$ Hợp đồng chuyển sang `Đã hoàn thành`, hệ thống **tự động chuyển xe về trạng thái "Sẵn sàng"** cho khách tiếp theo thuê.
4. **Cập nhật Báo cáo & Dashboard Realtime**:
   - Doanh thu hợp đồng tự động ghi nhận vào **Dashboard Tổng quan** (`/dashboard`) và **Báo cáo Doanh thu** (`/reports`).
   - Hỗ trợ xuất dữ liệu ra file Excel / CSV hoặc in ấn phiếu báo cáo PDF.

---

## 🔐 Cơ Chế Xác Thực & Bảo Mật (JWT Authentication)
* **Header Authorization**: Mọi API gọi từ Mobile App và Web Admin đều được ký và xác thực bằng Bearer JWT Token:
  ```http
  Authorization: Bearer <jwt_token>
  ```
* **Phân quyền vai trò (Role-based Access Control)**:
  * `Customer`: Phục vụ riêng cho Mobile App (đặt xe, theo dõi hợp đồng, quản lý hồ sơ).
  * `Nhân viên`: Điều hành đội xe, thẩm định đơn thuê, lập phiếu trả xe, quản lý bảo trì & đăng kiểm.
  * `Admin`: Toàn quyền hệ thống, quản lý nhân sự, xóa xe/hợp đồng, xem báo cáo doanh thu & lợi nhuận.
