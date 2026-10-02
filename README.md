# Hệ Thống Quản Lý Cho Thuê Xe (Car Rental Management System)

Dự án phát triển hệ thống cho thuê xe ô tô có tài xế và tự lái phục vụ toàn quốc theo kiến trúc 3 tầng độc lập (3-tier architecture): **Backend RESTful API** (Node.js/Express + MySQL), **Khách hàng trên Mobile App** (React Native Expo SDK 54 + TypeScript), và **Quản trị viên trên Web Admin Portal** (Next.js 14 App Router + Tailwind CSS).

---

## 🏗️ Cấu Trúc Tổng Thể Dự Án (Repository Structure)

```
QLTTThueXe-DoAn4/
├── backend/                 # Node.js + Express API (MVC, MySQL, JWT + Session)
│   ├── app.js               # Khởi tạo Express, CORS, Static Uploads, Route Index
│   ├── bin/www              # Entrypoint server (Cổng 5000)
│   ├── common/              # Kết nối MySQL Pool, JWT helper, Password hashing, Geocoding validator
│   ├── controllers/         # Auth, Car, Contract, Return, Penalty, Inspection, Maintenance, Report
│   ├── database/
│   │   ├── schema.sql       # Cấu trúc bảng CSDL (NguoiDung, KhachHang, NhanVien, Xe, DangKiem,...)
│   │   ├── seed.sql         # Dữ liệu mẫu ban đầu gọn nhẹ (20 xe)
│   │   ├── seed_1000.sql    # Bộ dữ liệu lớn quy mô toàn quốc (~1000 xe, 1000 khách, 1000 hợp đồng)
│   │   └── generate_seed_1000.js # Script tự động sinh dữ liệu quy mô lớn
│   ├── middlewares/         # asyncHandler, authMiddleware (JWT Verification & Role Check)
│   ├── models/              # Truy vấn cơ sở dữ liệu MySQL (Prepared Statements / Pool Query)
│   ├── routes/              # Định tuyến API RESTful
│   └── uploads/             # Ảnh xe (/uploads/car) và ảnh giấy tờ đặt xe (/uploads/booking)
│
├── mobile-app/              # React Native Mobile App dành cho Khách Hàng (Expo SDK 54 + TypeScript)
│   ├── assets/              # Icons, Splash screen
│   ├── src/
│   │   ├── api/             # Axios Interceptors tự động gắn Bearer Token
│   │   ├── components/      # UI components (Button, Input, CarCard, Header có nút Reload 🔄, Badge)
│   │   ├── constants/       # Theme, Colors, Config tự động tìm IP Metro
│   │   ├── context/         # AuthContext (JWT Storage AsyncStorage, Session sync)
│   │   ├── navigation/      # AuthNavigator, MainTabNavigator (5 Tabs responsive), RootNavigator
│   │   ├── screens/         # Màn hình Mobile:
│   │   │   ├── auth/        # LoginScreen, RegisterScreen
│   │   │   ├── home/        # HomeScreen (Carousel xe nổi bật, Hãng xe, Banner)
│   │   │   ├── cars/        # CarListScreen (Lọc địa chỉ toàn quốc, loại xe, giá), CarDetailScreen
│   │   │   ├── booking/     # BookingScreen (Khóa CCCD/GPLX theo tài khoản, upload ảnh), BookingSuccessScreen
│   │   │   ├── rentals/     # MyRentalsScreen (Theo dõi trạng thái), RentalDetailScreen (Biên bản trả & Phạt)
│   │   │   ├── lookup/      # LookupScreen (Tra cứu hợp đồng độc lập không cần login)
│   │   │   └── profile/     # ProfileScreen (Hồ sơ, Sửa giấy tờ, CSKH, Đăng xuất)
│   │   └── types/           # Định nghĩa Types TypeScript
│   ├── App.tsx              # Khung hiển thị tối ưu đa thiết bị (Mobile, Tablet, Web desktop)
│   └── package.json
│
├── web-admin/               # Web Next.js 14 dành cho Quản Trị Viên & Nhân Viên (Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/     # Layout Admin bảo vệ bằng JWT & Role (Drawer Sidebar responsive)
│   │   │   │   ├── dashboard/    # KPI Realtime, Biểu đồ Doanh thu 12 tháng, Donut xe, Cảnh báo
│   │   │   │   ├── cars/         # Quản lý Đội xe, Thêm/Sửa xe, Upload ảnh, Phân trang
│   │   │   │   ├── inspection/   # Quản lý Đăng kiểm xe, Cảnh báo sắp/quá hạn, Phân trang
│   │   │   │   ├── maintenance/  # Quản lý Bảo trì, Tự động điền ngày hoàn thành, Phân trang
│   │   │   │   ├── contracts/    # Phê duyệt hợp đồng từ App, Gallery ảnh CCCD/Bằng lái, Phân trang
│   │   │   │   ├── returns/      # Lập phiếu trả xe, Tích hợp phạt vi phạm, Quyết toán, Phân trang
│   │   │   │   ├── penalties/    # Biên bản phí phạt phát sinh tự động từ trả xe, Phân trang
│   │   │   │   ├── reports/      # Báo cáo Tài chính, Lợi nhuận thuần từng xe, In PDF / Xuất CSV
│   │   │   │   ├── customers/    # Danh sách khách hàng, Xem lịch sử toàn bộ các chuyến thuê, Phân trang
│   │   │   │   ├── contacts/     # Hộp thư CSKH, Cập nhật trạng thái 'Đã phản hồi', Phân trang
│   │   │   │   ├── employees/    # Quản trị nhân sự, Phân quyền Admin/Staff, Khóa tài khoản, Phân trang
│   │   │   │   └── settings/     # Cài đặt thông tin công ty, Ngưỡng cảnh báo đăng kiểm
│   │   │   └── login/       # Đăng nhập Cổng Quản Trị (Hỗ trợ cả /auth/login)
│   │   ├── components/      # Sidebar (11 modules), Header, Pagination, StatCard, Badge
│   │   ├── context/         # AuthContext, SidebarContext (Responsive Drawer)
│   │   ├── services/        # 10 Services Axios kết nối Backend API
│   │   └── types/           # Định nghĩa Type TypeScript
│   └── package.json
│
└── README.md                # Tài liệu hướng dẫn cài đặt & kịch bản kiểm thử chi tiết
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### 1. Chuẩn bị Cơ sở dữ liệu MySQL
1. Khởi động **MySQL** trên **XAMPP** hoặc **Laragon** (Cổng mặc định `3306`).
2. Mở phpMyAdmin hoặc MySQL Client, tạo cơ sở dữ liệu:
   ```sql
   CREATE DATABASE IF NOT EXISTS web_thue_xe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE web_thue_xe;
   ```
3. Import các file SQL theo đúng thứ tự:
   * **Bước 3.1**: Import file `backend/database/schema.sql` (Khởi tạo toàn bộ cấu trúc bảng).
   * **Bước 3.2**: Chọn 1 trong 2 bộ dữ liệu mẫu tùy theo nhu cầu:
     - **Lựa chọn A (Bộ 1.000 bản ghi lớn toàn quốc - Khuyên dùng để test hiệu năng)**: Import file `backend/database/seed_1000.sql` (Chứa 1.000 xe, 1.000 khách hàng, 1.000 hợp đồng, 1.000 đăng kiểm, 1.000 bảo trì trải dài trên toàn quốc).
     - **Lựa chọn B (Bộ 20 xe gọn nhẹ ban đầu)**: Import file `backend/database/seed.sql`.

---

### 2. Khởi chạy Backend (`backend/`)
Mở Terminal 1 và chạy:
```bash
cd backend
npm install
# Tạo file cấu hình môi trường:
cp .env.example .env
# Khởi động máy chủ API:
npm run dev
```
* API Server lắng nghe tại: **`http://localhost:5000`**

---

### 3. Khởi chạy Web Admin Portal (`web-admin/`)
Mở Terminal 2 và chạy:
```bash
cd web-admin
npm install
npm run dev
```
* Mở trình duyệt truy cập: **`http://localhost:3000`**

---

### 4. Khởi chạy Mobile App (`mobile-app/`)
Mở Terminal 3 và chạy:
```bash
cd mobile-app
npm install --legacy-peer-deps
npx expo start
```
* **Chạy thử trên trình duyệt Web**: Bấm phím **`w`** (mở tại `http://localhost:8081`).
* **Chạy trên thiết bị thật (iOS / Android)**: Mở ứng dụng **Expo Go** trên điện thoại và quét mã QR trên màn hình.

---

## 🔐 Danh Sách Tài Khoản Thử Nghiệm (Test Accounts)

| Phân hệ | Vai trò | Tên đăng nhập (Email) | Mật khẩu | Phạm vi sử dụng |
|---|---|---|:---:|---|
| **Web Admin** | Quản trị viên cao cấp (`Admin`) | `admin@thuexetudong.vn` | `123456` | Toàn quyền hệ thống, quản lý nhân viên, xóa xe, báo cáo doanh thu |
| **Web Admin** | Quản trị viên phụ (`Admin`) | `admin@carhire.vn` | `admin123` | Quản trị hệ thống |
| **Web Admin** | Nhân viên điều phối (`Nhân viên`) | `nv1@thuexetudong.vn` | `123456` | Quản lý đội xe, duyệt hợp đồng, lập phiếu trả xe, bảo trì, CSKH |
| **Mobile App** | Khách hàng thành viên (`Customer`) | `khachhang1@gmail.com` | `123456` | Đặt xe trực tuyến, xem hợp đồng, tra cứu, gửi góp ý CSKH |
| **Mobile App** | Khách hàng phụ (`Customer`) | `khach01@khachhang.vn` | `123456` | Đặt xe trực tuyến |

---

## 📱 KỊCH BẢN KIỂM THỬ TRÊN MOBILE APP (DÀNH CHO KHÁCH HÀNG)

*Đăng nhập bằng tài khoản: `khachhang1@gmail.com` / `123456` (hoặc bấm "Đăng ký ngay" để tạo tài khoản mới).*

| STT | Chức năng test | Các bước thao tác | Kết quả mong đợi |
|:---:|---|---|---|
| **M1** | **Đăng ký tài khoản mới** | 1. Bấm "Đăng ký ngay"<br>2. Nhập: Họ tên, SĐT, Email, Mật khẩu, CCCD, GPLX, Địa chỉ<br>3. Bấm "Đăng Ký Tài Khoản" | - Đăng ký thành công.<br>- Tài khoản & mật khẩu lưu vào bảng `NguoiDung`, hồ sơ lưu vào bảng `KhachHang`.<br>- Tự động đăng nhập và lưu JWT vào AsyncStorage. |
| **M2** | **Đăng nhập khách hàng** | 1. Nhập `khachhang1@gmail.com`<br>2. Mật khẩu: `123456`<br>3. Bấm "Đăng Nhập" | - Đăng nhập thành công, chuyển hướng vào Trang chủ.<br>- Lưu phiên làm việc an toàn. |
| **M3** | **Trang chủ & Xe nổi bật** | 1. Xem banner "Thuê Xe Có Tài Xế"<br>2. Xem danh sách xe nổi bật trượt ngang<br>3. Bấm nút 🔄 trên Header để tải lại dữ liệu | - Hiển thị đúng lời chào theo tên khách.<br>- Xe nổi bật tải từ API `/api/cars/featured`.<br>- Badge xe hiển thị đúng (`Sẵn sàng`, `Đang thuê`, hoặc `Đăng kiểm`).<br>- Nút 🔄 làm mới dữ liệu tức thì. |
| **M4** | **Tìm kiếm xe theo Địa chỉ / Khu vực** | 1. Chuyển sang tab "Danh mục"<br>2. Nhập ô tìm kiếm địa chỉ: *"Cầu Giấy"*, *"Hà Nội"*, hoặc *"TP. Hồ Chí Minh"*<br>3. Bấm vào các chip khu vực: *"📍 Hà Nội"*, *"📍 Đà Nẵng"*, *"📍 TP. Hồ Chí Minh"* | - Lọc ra chính xác các xe thuộc khu vực bãi đỗ đó.<br>- Nhập "Hà Nội" hiển thị các xe tại Hà Nội; chọn thành phố khác hiển thị xe tại thành phố đó.<br>- Không phụ thuộc vào Google Map API. |
| **M5** | **Xem chi tiết xe & Cảnh báo đăng kiểm** | 1. Bấm vào một xe bình thường<br>2. Bấm vào một xe hết hạn đăng kiểm (Badge "Đăng kiểm")<br>3. Xem mục "Lịch Đã Đặt Trước Của Xe" | - Xe bình thường: hiển thị nút "Đặt Xe Ngay".<br>- Xe hết hạn đăng kiểm: hiển thị cảnh báo đỏ và khóa nút đặt xe để bảo đảm an toàn.<br>- Hiển thị các khoảng ngày xe đã có khách đặt trước. |
| **M6** | **Đặt xe & Chống trùng lịch** | 1. Chọn ngày nhận và ngày trả xe<br>2. Kiểm tra các dòng CCCD, GPLX, Địa chỉ<br>3. Bấm nút "+ Thêm ảnh"<br>4. Nhập điểm đón ngoài lãnh thổ Việt Nam<br>5. Nhập điểm đón hợp lệ tại Việt Nam và bấm "Đặt xe" | - CCCD, GPLX, Địa chỉ được **tự động điền và khóa cố định theo tài khoản**.<br>- Nếu chọn ngày trùng với lịch xe đã bận: hiển thị cảnh báo đỏ và **vô hiệu hóa nút đặt xe**.<br>- Trên Web/PC: bấm thêm ảnh mở trực tiếp cửa sổ chọn file Windows mượt mà; trên Mobile mở tùy chọn Chụp/Thư viện.<br>- Nếu địa chỉ ngoài Việt Nam: cảnh báo địa chỉ không phục vụ.<br>- Đặt xe thành công $\rightarrow$ Chuyển sang màn hình "Đặt Xe Thành Công" hiển thị Mã HĐ và số tài khoản ngân hàng cọc 30%. |
| **M7** | **Quản lý Đơn thuê của tôi** | 1. Chuyển sang tab "Đơn thuê"<br>2. Chuyển giữa các tab: *Chờ xác nhận, Đang hiệu lực, Đã hoàn thành*<br>3. Bấm nút 🔄 trên Header<br>4. Bấm vào 1 đơn thuê để xem chi tiết | - Hiển thị danh sách hợp đồng cá nhân của khách.<br>- Nút 🔄 làm mới tiến độ hợp đồng ngay lập tức.<br>- Xem chi tiết: tình trạng xe, lịch trình, tiền cọc, số tiền còn lại, biên bản trả xe và phí phạt (nếu có). |
| **M8** | **Tra cứu hợp đồng độc lập** | 1. Chuyển sang tab "Tra cứu"<br>2. Nhập Mã HĐ (ví dụ `HD00001`) hoặc SĐT<br>3. Bấm "Tra Cứu Ngay" | - Tra cứu thành công thông tin hợp đồng mà không cần tài khoản đăng nhập. |
| **M9** | **Tài khoản cá nhân & CSKH** | 1. Chuyển sang tab "Tài khoản"<br>2. Bấm "Cập nhật hồ sơ & giấy tờ"<br>3. Bấm "Gửi yêu cầu hỗ trợ" gửi 1 phản hồi<br>4. Bấm "Đăng Xuất Khỏi Thiết Bị" | - Cập nhật thông tin giấy tờ thành công.<br>- Tin nhắn hỗ trợ gửi lên hệ thống chuyển về mục CSKH của Admin.<br>- Xác nhận đăng xuất mượt mà trên cả Web lẫn Mobile, đưa về màn hình Đăng nhập. |

---

## 💻 KỊCH BẢN KIỂM THỬ TRÊN WEB ADMIN PORTAL (DÀNH CHO QUẢN TRỊ VIÊN)

*Đăng nhập bằng tài khoản Admin: `admin@thuexetudong.vn` / `123456`.*

| STT | Chức năng test | Các bước thao tác | Kết quả mong đợi |
|:---:|---|---|---|
| **W1** | **Đăng nhập Admin** | 1. Mở `http://localhost:3000/login`<br>2. Nhập `admin@thuexetudong.vn` / `123456`<br>3. Bấm "Đăng Nhập Quản Trị" | - Xác thực qua bảng `NguoiDung`.<br>- Lưu JWT Token và mở Dashboard quản trị. |
| **W2** | **Dashboard Tổng quan** | 1. Xem 4 thẻ KPI đầu trang<br>2. Xem Biểu đồ Doanh thu 12 tháng (Recharts)<br>3. Xem Biểu đồ Donut trạng thái đội xe<br>4. Xem Trung tâm cảnh báo rủi ro | - Hiển thị số liệu thời gian thực.<br>- Cảnh báo xe sắp hết hạn đăng kiểm và hợp đồng đến hạn trả xe.<br>- Nhật ký hoạt động giao dịch gần nhất. |
| **W3** | **Quản lý Đội xe (Fleet)** | 1. Vào menu "Quản lý Đội xe"<br>2. Kiểm tra thanh phân trang bên dưới bảng<br>3. Bấm "Thêm Xe Mới" (nhập tên, biển số, giá thuê, khu vực bãi đỗ...)<br>4. Bấm icon Tải lên ảnh xe 📤<br>5. Bấm icon Chỉnh sửa ✎ | - Biển số xe hiển thị nguyên vẹn trên 1 dòng (`whitespace-nowrap`), không bị xuống dòng.<br>- Phân trang mượt mà (10, 20, 50 bản ghi/trang).<br>- Thêm xe mới thành công, hiển thị đúng bãi đỗ.<br>- Tải ảnh đại diện xe từ máy tính hiển thị ngay lập tức.<br>- Admin có quyền xóa xe. |
| **W4** | **Phê duyệt hợp đồng từ Mobile** | 1. Vào menu "Hợp đồng thuê xe"<br>2. Kiểm tra phân trang bảng hợp đồng<br>3. Tìm đơn thuê vừa đặt từ Mobile App (trạng thái `Chờ xác nhận`)<br>4. Bấm icon Xem 👁️ để xem Gallery ảnh CCCD/GPLX khách gửi<br>5. Bấm nút "Duyệt Đơn" | - Xem phóng to ảnh giấy tờ khách hàng gửi lên từ app.<br>- Bấm Duyệt $\rightarrow$ Hợp đồng chuyển sang `Đang hiệu lực`, **xe tự động chuyển sang trạng thái "Đang thuê"**.<br>- Phân trang hoạt động chính xác. |
| **W5** | **Trả xe, Xử lý phạt & Quyết toán** | 1. Vào menu "Trả xe & Quyết toán"<br>2. Bấm "Lập Phiếu Trả Xe"<br>3. Chọn hợp đồng đang thuê<br>4. Tích chọn `[✔] Phát sinh phí phạt vi phạm`<br>5. Nhập số tiền phạt (ví dụ 200.000đ) và lý do vi phạm<br>6. Bấm "Hoàn Tất Trả Xe & Quyết Toán" | - Bảng quyết toán tự động: Tiền thuê thực tế - Cọc + **Phí phạt**.<br>- Hợp đồng chuyển sang `Đã hoàn thành`.<br>- **Xe tự động chuyển về trạng thái "Sẵn sàng"**.<br>- **Biên bản phạt tự động được sinh ra trong mục "Biên bản Phí phạt"**.<br>- Bảng phiếu trả xe phân trang đầy đủ. |
| **W6** | **Tra cứu Biên bản Phí phạt** | 1. Vào menu "Biên bản Phí phạt"<br>2. Xem bản ghi phạt vừa sinh từ bước trả xe<br>3. Kiểm tra biển số xe và thanh phân trang<br>4. Bấm icon Xem chi tiết 👁️ | - Biển số xe và loại vi phạm hiển thị thẳng hàng, không bị ngắt dòng.<br>- Không bị dư thừa nút lập phiếu thủ công (chuẩn luồng nghiệp vụ).<br>- Hiển thị đầy đủ thông tin khách vi phạm, phương tiện, lý do và số tiền.<br>- Phân trang hoạt động mượt mà. |
| **W7** | **Hồ sơ Đăng kiểm** | 1. Vào menu "Hồ sơ Đăng kiểm"<br>2. Xem danh sách hạn kiểm định của các xe<br>3. Kiểm tra phân trang và biển số xe<br>4. Bấm "Thêm Hồ Sơ Đăng Kiểm" | - Thẻ thống kê phân loại: Còn hạn (Xanh), Sắp hết hạn (Vàng), Hết hạn (Đỏ).<br>- Tự động tính số ngày còn lại của từng xe.<br>- Biển số xe không bị vỡ dòng, phân trang đầy đủ. |
| **W8** | **Bảo trì & Sửa chữa** | 1. Vào menu "Bảo trì & Sửa chữa"<br>2. Kiểm tra cột "Biển Số" trong bảng<br>3. Bấm "Tạo Phiếu Bảo Trì" cho 1 xe (trạng thái `Đang bảo trì`)<br>4. Bấm nút "Xong" (Hoàn thành) tại một phiếu đang bảo trì | - **Biển số xe hiển thị chuẩn xác trên 1 dòng, không bị ngắt thành 2 dòng**.<br>- Khi tạo phiếu: **xe tự động chuyển sang "Bảo trì"**.<br>- Khi bấm Hoàn thành: **hệ thống tự động điền ngày hoàn thành là ngày hôm nay** và **xe tự động trở về "Sẵn sàng"**.<br>- Phân trang hoạt động mượt mà. |
| **W9** | **Báo cáo Doanh thu & Lợi nhuận** | 1. Vào menu "Báo cáo Doanh thu"<br>2. Chọn khoảng ngày $\rightarrow$ Bấm "Xem Báo Cáo"<br>3. Kiểm tra phân trang danh sách xe trong báo cáo<br>4. Bấm "Xuất File CSV"<br>5. Bấm "In Báo Cáo" | - Bảng phân tích chi tiết từng xe: Lượt thuê, Doanh thu, Chi phí bảo trì, Thu tiền phạt, Lợi nhuận ròng.<br>- Phân trang danh sách xe trong báo cáo.<br>- Xuất file CSV mở trên Excel chuẩn tiếng Việt UTF-8.<br>- In báo cáo khổ A4 / PDF chuẩn tài liệu doanh nghiệp. |
| **W10** | **Quản lý Nhân sự (Admin Only)** | 1. Vào menu "Quản lý Nhân sự"<br>2. Bấm "Thêm Nhân Viên" mới<br>3. Bấm icon Khóa 🔒 / Mở khóa 🔓<br>4. Kiểm tra phân trang danh sách nhân viên | - Tài khoản nhân viên mới được tạo đồng bộ vào bảng `NguoiDung`.<br>- Khi khóa tài khoản, nhân viên đó không thể đăng nhập portal.<br>- Phân trang hoạt động chính xác. |
| **W11** | **Hộp thư Liên hệ (CSKH)** | 1. Vào menu "Hộp thư Liên hệ"<br>2. Tìm tin nhắn gửi từ Mobile App<br>3. Bấm "Đánh dấu xong"<br>4. Kiểm tra phân trang danh sách tin nhắn | - Tin nhắn chuyển trạng thái từ `Mới` $\rightarrow$ `Đã phản hồi`.<br>- Bảng tin nhắn hỗ trợ phân trang mượt mà. |
| **W12** | **Kiểm tra Responsive Layout** | 1. Thu nhỏ cửa sổ trình duyệt hoặc bật F12 sang iPad / iPhone<br>2. Thử mở Menu Hamburger $\mathbf{\equiv}$ | - Menu trượt mượt mà dạng Drawer bên trái kèm nền mờ.<br>- Bảng biểu và nội dung tự co giãn không bị vỡ layout trên mọi kích thước màn hình. |

---

## 🔄 Sơ Đồ Luồng Vận Hành Liên Thông Toàn Hệ Thống (E2E Integration)

```
[Khách hàng trên Mobile App]
  │
  ├─► 1. Đăng ký / Đăng nhập (Lưu tài khoản vào NguoiDung & hồ sơ vào KhachHang)
  ├─► 2. Tìm xe theo Địa chỉ / Bãi đỗ toàn quốc (Lọc theo tỉnh thành / quận huyện)
  ├─► 3. Đặt xe trực tuyến:
  │      - Tự động điền & khóa cố định CCCD, GPLX, Địa chỉ từ tài khoản
  │      - Kiểm tra chống trùng lịch nếu xe đã có khách khác đặt trước
  │      - Upload ảnh chụp CCCD/GPLX (Hỗ trợ cả Web PC lẫn Mobile)
  │
  ▼
[Hệ thống Backend API] ──► Lưu HopDongThue ở trạng thái 'Chờ xác nhận'
  │
  ▼
[Quản trị viên / Nhân viên trên Web Admin]
  │
  ├─► 4. Kiểm tra đơn tại mục "Hợp đồng thuê xe" (/contracts)
  │      - Xem Gallery ảnh giấy tờ mà khách gửi lên từ app (click phóng to)
  │      - Bấm "Duyệt Đơn" ──► Hợp đồng chuyển 'Đang hiệu lực', Xe tự động chuyển 'Đang thuê'
  │
  ├─► 5. Bàn giao & Thu hồi xe tại mục "Trả xe & Quyết toán" (/returns):
  │      - Lập phiếu trả xe, ghi nhận hiện trạng
  │      - Tích chọn lập biên bản phạt vi phạm nếu có (trả muộn, trầy xước)
  │      - Tự động tính: Tiền thuê thực tế - Cọc + Phạt = Số tiền thanh toán
  │      - Hoàn tất ──► Hợp đồng chuyển 'Đã hoàn thành', Xe tự động về 'Sẵn sàng'
  │                     Biên bản phạt tự động sinh ra trong mục "Biên bản Phí phạt" (/penalties)
  │
  └─► 6. Thống kê & Báo cáo Realtime:
         - Doanh thu, chi phí, lợi nhuận ròng cập nhật ngay lên Dashboard (/dashboard)
         - Xem Báo cáo tài chính chi tiết từng xe (/reports), in ấn PDF hoặc xuất file CSV
```

---

## 🛡️ Cơ Chế Bảo Mật & Phân Quyền Tập Trung (RBAC)

1. **Bảng tài khoản tập trung (`NguoiDung`)**:
   - Quản lý toàn bộ thông tin đăng nhập, phân vùng (`admin` / `customer`), vai trò và trạng thái khóa tài khoản.
   - Bảng `KhachHang` và `NhanVien` chỉ lưu hồ sơ thông tin và liên kết qua khóa ngoại `MaND`.
2. **Bearer JWT Token**:
   - Mọi yêu cầu API từ Web Admin và Mobile App đều được ký điện tử và xác thực thông qua HTTP Header:
     ```http
     Authorization: Bearer <jwt_token>
     ```
3. **Phân quyền vai trò**:
   - `Customer`: Thao tác trên Mobile App (đặt xe, theo dõi hợp đồng, xem biên bản trả xe & phạt).
   - `Nhân viên`: Điều hành đội xe, duyệt đơn thuê, lập phiếu trả xe & quyết toán phạt, quản lý bảo trì & đăng kiểm.
   - `Admin`: Toàn quyền hệ thống, quản lý tài khoản nhân viên, xem báo cáo tài chính & lợi nhuận, xóa dữ liệu.
