# HƯỚNG DẪN TEST TOÀN BỘ CHỨC NĂNG HỆ THỐNG (TESTING GUIDE)

Tài liệu này hướng dẫn chi tiết các bước kiểm thử chức năng trên cả 2 nền tảng: **Khách hàng (Mobile App)** và **Quản trị viên (Web Admin Portal)** sau khi hệ thống đã chuyển đổi sang bảng tài khoản tập trung `NguoiDung`.

---

## 🗄️ BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU MỚI (DATABASE SETUP)

> ⚠️ **LƯU Ý QUAN TRỌNG**: Do cấu trúc bảng đã được nâng cấp thêm bảng tài khoản tập trung `NguoiDung`, bạn hãy import lại file SQL để cập nhật dữ liệu mẫu.

1. Khởi động **MySQL** trên XAMPP hoặc Laragon (Cổng `3306`).
2. Mở phpMyAdmin hoặc MySQL Client:
   ```sql
   CREATE DATABASE IF NOT EXISTS web_thue_xe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE web_thue_xe;
   ```
3. Import 2 file theo đúng thứ tự:
   * **File 1**: `backend/database/schema.sql` (Tạo bảng `NguoiDung`, `KhachHang`, `NhanVien`, `Xe`,...)
   * **File 2**: Chọn 1 trong 2 bộ seed dữ liệu tùy nhu cầu:
     - **Lựa chọn A (Bộ 1000 bản ghi lớn toàn quốc - Khuyên dùng để test hiệu năng)**: Import file `backend/database/seed_1000.sql` (Bao gồm 1000 xe, 1000 khách hàng, 1000 hợp đồng, 1000 hồ sơ đăng kiểm, 1000 bảo trì trải dài khắp Hà Nội, TP.HCM, Đà Nẵng, Hải Phòng, Cần Thơ, Nha Trang, Đà Lạt, Vũng Tàu, Bình Dương, Đồng Nai, Quảng Ninh, Phú Quốc...).
     - **Lựa chọn B (Bộ 20 xe gọn nhẹ ban đầu)**: Import file `backend/database/seed.sql`.

---

## 🚀 BƯỚC 2: KHỞI CHẠY HỆ THỐNG

### 1. Khởi động Backend (Node.js API - Cổng 5000)
```bash
cd backend
npm run dev
# Server lắng nghe tại http://localhost:5000
```

### 2. Khởi động Web Admin (Next.js - Cổng 3000)
```bash
cd web-admin
npm run dev
# Mở trình duyệt tại http://localhost:3000
```

### 3. Khởi động Mobile App (Expo SDK 54 - Cổng 8081)
```bash
cd mobile-app
npx expo start
# Nhấn phím 'w' để test trên trình duyệt Web (http://localhost:8081)
# Hoặc quét mã QR qua ứng dụng Expo Go trên điện thoại
```

---

## 📱 BƯỚC 3: KỊCH BẢN KIỂM THỬ TRÊN MOBILE APP (DÀNH CHO KHÁCH HÀNG)

* **Tài khoản test mẫu sẵn có**: `khachhang1@gmail.com` / Mật khẩu: `123456`
* (Hoặc có thể đăng ký tài khoản mới trực tiếp trên app)

| STT | Chức năng test | Các bước thực hiện | Kết quả mong đợi |
|:---:|---|---|---|
| **M1** | **Đăng ký tài khoản mới** | 1. Bấm "Đăng ký ngay"<br>2. Nhập: Họ tên, SĐT, Email, Mật khẩu, CCCD, GPLX, Địa chỉ<br>3. Bấm "Đăng Ký Tài Khoản" | - Đăng ký thành công.<br>- Dữ liệu tài khoản lưu vào bảng `NguoiDung`, hồ sơ lưu vào bảng `KhachHang`.<br>- Tự động đăng nhập vào ứng dụng. |
| **M2** | **Đăng nhập khách hàng** | 1. Nhập `khachhang1@gmail.com`<br>2. Nhập mật khẩu: `123456`<br>3. Bấm "Đăng Nhập" | - Đăng nhập thành công, chuyển hướng vào Trang chủ.<br>- Token lưu vào AsyncStorage. |
| **M3** | **Trang chủ & Xe nổi bật** | 1. Xem banner "Thuê Xe Có Tài Xế"<br>2. Xem danh sách xe nổi bật trượt ngang<br>3. Bấm chọn nhanh các hãng xe (Toyota, Mazda, VinFast...) | - Hiển thị đúng lời chào theo tên khách.<br>- Xe nổi bật tải từ API `/api/cars/featured`.<br>- Badge xe hiển thị đúng (`Sẵn sàng`, `Đang thuê`, hoặc `Đăng kiểm`). |
| **M4** | **Lọc xe theo Địa chỉ / Bãi đỗ tại Hà Nội** | 1. Chuyển sang tab "Danh mục"<br>2. Nhập ô tìm kiếm địa chỉ: *"Cầu Giấy"* hoặc bấm chip *"📍 Cầu Giấy"*<br>3. Nhập ô tìm kiếm: *"Hà Nội"* | - Lọc ra đúng các xe có bãi đỗ tại Quận Cầu Giấy.<br>- Nhập "Hà Nội" hiển thị toàn bộ xe tại Hà Nội.<br>- Không phụ thuộc vào Google Map API. |
| **M5** | **Xem chi tiết xe & Cảnh báo đăng kiểm** | 1. Bấm vào một xe bình thường<br>2. Bấm vào một xe hết hạn đăng kiểm (Badge "Đăng kiểm")<br>3. Xem mục "Lịch Đã Đặt Trước Của Xe" | - Xe bình thường: hiển thị nút "Đặt Xe Ngay".<br>- Xe hết hạn đăng kiểm: hiển thị cảnh báo đỏ và khóa nút đặt xe.<br>- Hiển thị các khoảng ngày xe đã có khách đặt trước. |
| **M6** | **Đặt xe & Chống trùng lịch** | 1. Chọn ngày nhận và ngày trả xe<br>2. Kiểm tra các dòng CCCD, GPLX, Địa chỉ<br>3. Bấm nút "Thêm ảnh" | - Dòng CCCD, GPLX, Địa chỉ được **tự động điền và khóa cố định theo tài khoản**.<br>- Nếu chọn ngày trùng với lịch xe đã bận: hiển thị cảnh báo đỏ và **vô hiệu hóa nút đặt xe**.<br>- Trên Web/PC: bấm thêm ảnh mở trực tiếp cửa sổ chọn file Windows mượt mà.<br>- Đặt xe thành công $\rightarrow$ Chuyển sang màn hình "Đặt Xe Thành Công" hiển thị Mã HĐ và số tài khoản ngân hàng đặt cọc. |
| **M7** | **Quản lý Đơn thuê của tôi** | 1. Chuyển sang tab "Đơn thuê"<br>2. Chuyển giữa các tab: *Chờ xác nhận, Đang hiệu lực, Đã hoàn thành*<br>3. Bấm vào 1 đơn thuê để xem chi tiết | - Hiển thị danh sách hợp đồng cá nhân của khách.<br>- Xem chi tiết: tình trạng xe, lịch trình, tiền cọc, số tiền còn lại, biên bản trả xe và phí phạt (nếu có). |
| **M8** | **Tra cứu hợp đồng độc lập** | 1. Chuyển sang tab "Tra cứu"<br>2. Nhập Mã HĐ (ví dụ `HD001`) hoặc SĐT<br>3. Bấm "Tra Cứu Ngay" | - Tra cứu thành công thông tin hợp đồng mà không cần tài khoản đăng nhập. |
| **M9** | **Tài khoản cá nhân & CSKH** | 1. Chuyển sang tab "Tài khoản"<br>2. Bấm "Cập nhật hồ sơ & giấy tờ"<br>3. Bấm "Gửi yêu cầu hỗ trợ" gửi 1 phản hồi<br>4. Bấm "Đăng xuất" | - Cập nhật thông tin giấy tờ thành công.<br>- Tin nhắn hỗ trợ gửi lên hệ thống chuyển về mục CSKH của Admin.<br>- Đăng xuất an toàn về màn hình Đăng nhập. |

---

## 💻 BƯỚC 4: KỊCH BẢN KIỂM THỬ TRÊN WEB ADMIN PORTAL (DÀNH CHO QUẢN TRỊ VIÊN)

* **Tài khoản Quản trị viên (Admin)**: `admin@thuexetudong.vn` / Mật khẩu: `123456`
* **Tài khoản Nhân viên điều hành**: `nv1@thuexetudong.vn` / Mật khẩu: `123456`

| STT | Chức năng test | Các bước thực hiện | Kết quả mong đợi |
|:---:|---|---|---|
| **W1** | **Đăng nhập Admin** | 1. Mở `http://localhost:3000/login`<br>2. Nhập `admin@thuexetudong.vn` / `123456`<br>3. Bấm "Đăng Nhập Quản Trị" | - Hệ thống xác thực qua bảng `NguoiDung`.<br>- Lưu JWT Token và mở Dashboard quản trị. |
| **W2** | **Dashboard Tổng quan** | 1. Xem 4 thẻ KPI đầu trang<br>2. Xem Biểu đồ Doanh thu 12 tháng (Recharts)<br>3. Xem Biểu đồ Donut trạng thái đội xe<br>4. Xem Trung tâm cảnh báo rủi ro | - Hiển thị số liệu thời gian thực.<br>- Cảnh báo các xe sắp hết hạn đăng kiểm và hợp đồng đến hạn trả xe.<br>- Nhật ký hoạt động giao dịch gần nhất. |
| **W3** | **Quản lý Đội xe (Fleet)** | 1. Vào menu "Quản lý Đội xe"<br>2. Bấm "Thêm Xe Mới" (nhập tên, biển số, giá thuê, khu vực bãi đỗ...)<br>3. Bấm icon Tải lên ảnh xe 📤<br>4. Bấm icon Chỉnh sửa ✎ | - Thêm xe mới thành công, hiển thị đúng bãi đỗ tại Hà Nội.<br>- Tải ảnh đại diện xe từ máy tính hiển thị ngay lập tức.<br>- Admin có quyền xóa xe. |
| **W4** | **Phê duyệt hợp đồng từ Mobile** | 1. Vào menu "Hợp đồng thuê xe"<br>2. Tìm đơn thuê vừa đặt từ Mobile App (trạng thái `Chờ xác nhận`)<br>3. Bấm icon Xem 👁️ để xem Gallery ảnh CCCD/GPLX khách gửi<br>4. Bấm nút "Duyệt Đơn" | - Xem phóng to ảnh giấy tờ khách hàng gửi lên từ app.<br>- Bấm Duyệt $\rightarrow$ Hợp đồng chuyển sang `Đang hiệu lực`, **xe tự động chuyển sang trạng thái "Đang thuê"**. |
| **W5** | **Trả xe, Xử lý phạt & Quyết toán** | 1. Vào menu "Trả xe & Quyết toán"<br>2. Bấm "Lập Phiếu Trả Xe"<br>3. Chọn hợp đồng đang thuê<br>4. Tích chọn `[✔] Phát sinh phí phạt vi phạm`<br>5. Nhập số tiền phạt (ví dụ 200.000đ) và lý do<br>6. Bấm "Hoàn Tất Trả Xe" | - Bảng quyết toán tự động: Tiền thuê thực tế - Cọc + **Phí phạt**.<br>- Hợp đồng chuyển sang `Đã hoàn thành`.<br>- **Xe tự động chuyển về trạng thái "Sẵn sàng"**.<br>- **Biên bản phạt tự động được sinh ra trong mục "Biên bản Phí phạt"**. |
| **W6** | **Tra cứu Biên bản Phí phạt** | 1. Vào menu "Biên bản Phí phạt"<br>2. Xem bản ghi phạt vừa sinh từ bước trả xe<br>3. Bấm icon Xem chi tiết 👁️ | - Hiển thị đầy đủ thông tin khách vi phạm, phương tiện, lý do và số tiền.<br>- Trang này thuần tra cứu và quản lý xóa, không bị dư thừa nút lập phiếu. |
| **W7** | **Hồ sơ Đăng kiểm** | 1. Vào menu "Hồ sơ Đăng kiểm"<br>2. Xem danh sách hạn kiểm định của các xe<br>3. Bấm "Thêm Hồ Sơ Đăng Kiểm" | - Thẻ thống kê phân loại: Còn hạn (Xanh), Sắp hết hạn (Vàng), Hết hạn (Đỏ).<br>- Tự động tính số ngày còn lại của từng xe. |
| **W8** | **Bảo trì & Sửa chữa** | 1. Vào menu "Bảo trì & Sửa chữa"<br>2. Bấm "Tạo Phiếu Bảo Trì" cho 1 xe (trạng thái `Đang bảo trì`)<br>3. Bấm nút "Xong" (Hoàn thành) | - Khi tạo phiếu: **xe tự động chuyển sang "Bảo trì"**.<br>- Khi bấm Hoàn thành: **xe tự động trở về "Sẵn sàng"**. |
| **W9** | **Báo cáo Doanh thu & Lợi nhuận** | 1. Vào menu "Báo cáo Doanh thu"<br>2. Chọn khoảng ngày $\rightarrow$ Bấm "Xem Báo Cáo"<br>3. Bấm "Xuất File CSV"<br>4. Bấm "In Báo Cáo" | - Bảng phân tích chi tiết từng xe: Lượt thuê, Doanh thu, Chi phí bảo trì, Thu tiền phạt, Lợi nhuận ròng.<br>- Xuất file CSV mở trên Excel chuẩn tiếng Việt.<br>- In báo cáo khổ A4 / PDF chuẩn tài liệu doanh nghiệp. |
| **W10** | **Quản lý Nhân sự (Admin Only)** | 1. Vào menu "Quản lý Nhân sự"<br>2. Bấm "Thêm Nhân Viên" mới<br>3. Bấm icon Khóa 🔒 / Mở khóa 🔓 | - Tài khoản nhân viên mới được tạo đồng bộ vào bảng `NguoiDung`.<br>- Khi khóa tài khoản, nhân viên đó không thể đăng nhập portal. |
| **W11** | **Hộp thư Liên hệ (CSKH)** | 1. Vào menu "Hộp thư Liên hệ"<br>2. Tìm tin nhắn gửi từ Mobile App<br>3. Bấm "Đánh dấu xong" | - Tin nhắn chuyển trạng thái từ `Mới` $\rightarrow$ `Đã phản hồi`. |
| **W12** | **Kiểm tra Responsive Layout** | 1. Thu nhỏ cửa sổ trình duyệt hoặc bật Device Toolbar (F12) sang iPad / iPhone<br>2. Thử mở Menu Hamburger $\mathbf{\equiv}$ | - Menu trượt mượt mà dạng Drawer bên trái kèm nền mờ.<br>- Bảng biểu và nội dung tự co giãn không bị vỡ layout. |

---

## 🔄 BƯỚC 5: TÓM TẮT LUỒNG LIÊN THÔNG ĐẦY ĐỦ (END-TO-END FLOW)

$$\begin{aligned}
\text{Khách Đăng ký / Đăng nhập (App)} &\longrightarrow \text{Tìm xe theo bãi đỗ Hà Nội} \longrightarrow \text{Đặt xe \& gửi ảnh CCCD/GPLX} \\
&\downarrow \\
\text{Admin thấy đơn 'Chờ xác nhận'} &\longrightarrow \text{Xem ảnh giấy tờ \& Duyệt đơn} \longrightarrow \text{Xe chuyển 'Đang thuê'} \\
&\downarrow \\
\text{Khách trả xe} &\longrightarrow \text{Admin lập phiếu trả xe \& tích chọn phạt} \longrightarrow \text{Xe về 'Sẵn sàng'} \\
&\downarrow \\
\text{Tự động sinh Biên bản phạt} &\longrightarrow \text{Doanh thu \& Lợi nhuận cập nhật ngay lên Dashboard \& Báo cáo}
\end{aligned}$$
