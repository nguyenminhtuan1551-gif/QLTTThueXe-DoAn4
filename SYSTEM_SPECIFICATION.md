# TÀI LIỆU PHÂN TÍCH VÀ ĐẶC TẢ HỆ THỐNG QUẢN LÝ TRUNG TÂM CHO THUÊ XE
*(Car Rental Management System - Specification & Migration Guide)*

---

## I. TỔNG QUAN DỰ ÁN HIỆN TẠI

### 1. Giới thiệu dự án
Hệ thống **Quản lý trung tâm cho thuê xe (QLTrungTamChoThueXe)** là giải pháp phần mềm toàn diện hỗ trợ tự động hóa quy trình cho thuê xe ô tô tự lái/có tài xế, từ việc quản lý đội xe, đăng kiểm, bảo trì, cho đến quản lý khách hàng, đặt xe trực tuyến, lập hợp đồng, trả xe - quyết toán, xử lý phí phạt và báo cáo tài chính.

### 2. Kiến trúc công nghệ hiện tại
- **Backend**:
  - Nền tảng: Node.js + Express.js (Mô hình MVC chuẩn: Controller - Model - Route - Middleware).
  - Cơ sở dữ liệu: MySQL (Truy vấn qua thư viện `mysql2` dạng connection pool).
  - Authentication: Session-based (`express-session` + `cookie-parser`), mã hóa mật khẩu SHA-256 / PBKDF2.
  - Upload file: `multer` (Lưu trữ ảnh xe tại `uploads/car/` và ảnh bằng lái/giao nhận tại `uploads/booking/`).
- **Frontend**:
  - Nền tảng: Next.js (App Router), React 18, TypeScript, Tailwind CSS, Radix UI / Shadcn UI components, Lucide Icons, Recharts.
  - Bao gồm 2 phân hệ gộp chung trong 1 web app:
    1. Giao diện công khai cho Khách hàng: Xem xe, đặt xe, tra cứu.
    2. Giao diện Quản trị viên (Admin/Staff): Bảng điều khiển quản lý nội bộ.

---

## II. CƠ SỞ DỮ LIỆU & MÔ HÌNH THỰC THỂ (DATABASE SCHEMA)

Hệ thống được thiết kế trên 10 bảng cơ sở dữ liệu quan hệ chặt chẽ:

1. **`NhanVien` (Nhân viên / Quản trị viên)**:
   - `MaNV` (PK), `HoTen`, `SDT`, `Email` (Unique), `ChucVu` ('Admin' | 'Nhân viên'), `MatKhau`, `TrangThai` ('Đang hoạt động' | 'Tạm khóa'), `CreatedAt`, `UpdatedAt`.
2. **`Xe` (Danh mục đội xe)**:
   - `MaXe` (PK), `BienSo` (Unique), `TenXe`, `LoaiXe` (Sedan, SUV, Crossover, Hatchback,...), `HangXe` (Toyota, Hyundai, Mazda, Honda, Kia, VinFast,...), `NamSanXuat`, `GiaThue` (VNĐ/ngày), `NhienLieu` (Xăng, Dầu, Điện, Hybrid), `SoCho` (4, 5, 7 chỗ), `TrangThai` ('Sẵn sàng' | 'Đang thuê' | 'Bảo trì'), `HinhAnh`, `GhiChu`, `CreatedAt`, `UpdatedAt`.
3. **`DangKiem` (Hồ sơ đăng kiểm xe)**:
   - `MaDK` (PK), `MaXe` (FK), `NgayDK`, `HanDK`, `TrangThai` ('Còn hạn' | 'Sắp hết hạn' | 'Hết hạn'), `GhiChu`.
4. **`KhachHang` (Hồ sơ khách hàng)**:
   - `MaKH` (PK), `HoTen`, `CCCD` (Unique), `SDT`, `Email` (Unique), `MatKhau`, `DiaChi`, `BangLai` (Số GPLX), `CreatedAt`, `UpdatedAt`.
5. **`HopDongThue` (Hợp đồng / Đơn thuê xe)**:
   - `MaHD` (PK), `MaKH` (FK), `MaXe` (FK), `NgayThue`, `NgayTraDuKien`, `DiemDon` (Điểm đón xe tại Hà Nội), `TienCoc`, `TongTien`, `TrangThai` ('Chờ xác nhận' | 'Đang hiệu lực' | 'Đã hoàn thành' | 'Đã hủy'), `GhiChu`.
6. **`AnhDatXe` (Hình ảnh giao nhận & giấy tờ đính kèm hợp đồng)**:
   - `MaAnh` (PK), `MaHD` (FK), `DuongDan`, `TenTep`, `CreatedAt`.
7. **`TraXe` (Phiếu trả xe & quyết toán hợp đồng)**:
   - `MaTraXe` (PK), `MaHD` (FK - Unique), `NgayTraXe`, `TinhTrangXe`, `SoNgayThueThucTe`, `TongTienThue`, `TienCoc`, `SoTienConLai`, `TongTienThanhToan`, `HinhThucThanhToan` ('Tiền mặt' | 'Chuyển khoản' | 'Momo' | 'ZaloPay'), `GhiChu`.
8. **`PhiPhat` (Biên bản xử lý vi phạm / phát sinh khi trả xe)**:
   - `MaPP` (PK), `MaTraXe` (FK), `LoaiPhiPhat` ('Phạt trả muộn' | 'Phạt hỏng hóc' | 'Cả trả muộn và hỏng hóc'), `SoTienPhat`, `GhiChu`.
9. **`BaoTri` (Hồ sơ bảo trì / bảo dưỡng / sửa chữa xe)**:
   - `MaBaoTri` (PK), `MaXe` (FK), `NgayBaoTri`, `NoiDung`, `ChiPhi`, `TrangThai` ('Đang bảo trì' | 'Hoàn thành').
10. **`LienHe` (Tin nhắn liên hệ từ khách hàng)**:
    - `MaLH` (PK Auto), `HoTen`, `SDT`, `Email`, `NoiDung`, `TrangThai` ('Mới' | 'Đã phản hồi').
11. **`CaiDatHeThong` (Cấu hình hệ thống)**:
    - `MaCaiDat` (PK), `TenCongTy`, `SoDienThoai`, `EmailLienHe`, `DiaChi`, `ThongBaoEmail`, `CanhBaoDangKiem`, `CanhBaoHopDong`, `SoNgayCanhBaoDangKiem` (mặc định 30 ngày).

---

## III. CHI TIẾT CÁC TÍNH NĂNG ĐÃ THỰC HIỆN

### PHÂN HỆ 1: DÀNH CHO KHÁCH HÀNG (USER / CUSTOMER)

1. **Xác thực & Tài khoản khách hàng**:
   - **Đăng ký tài khoản**: Nhập Họ tên, Email, SĐT, Mật khẩu, CCCD, Địa chỉ, Số giấy phép lái xe (GPLX).
   - **Đăng nhập**: Đăng nhập qua Email và Mật khẩu.
   - **Thông tin cá nhân**: Lưu và tự động điền sẵn thông tin khi tiến hành đặt xe.

2. **Trang chủ & Khám phá dịch vụ**:
   - Banner quảng bá dịch vụ thuê xe tự lái / có lái.
   - Danh sách "Xe nổi bật" (Featured Cars) đang sẵn sàng.
   - Cam kết dịch vụ, hướng dẫn quy trình thuê xe 4 bước đơn giản, đánh giá khách hàng.

3. **Danh mục & Tìm kiếm xe (Car Catalog)**:
   - Hiển thị danh sách toàn bộ xe đang ở trạng thái sẵn sàng (`Sẵn sàng`).
   - Bộ lọc đa tiêu chí:
     + Lọc theo loại xe (Sedan, SUV, MPV, Bán tải,...).
     + Lọc theo hãng xe (Toyota, Mazda, Kia, Hyundai, Honda, VinFast,...).
     + Lọc theo số chỗ ngồi (4 chỗ, 5 chỗ, 7 chỗ).
     + Lọc theo loại nhiên liệu (Xăng, Dầu Diesel, Điện).
     + Lọc theo khoảng giá thuê (VNĐ/ngày).
   - Tìm kiếm nhanh theo tên xe / dòng xe / biển số.

4. **Trang Chi tiết xe (Car Detail)**:
   - Hiển thị chi tiết hình ảnh thực tế, thông số kỹ thuật (Hãng, Năm SX, Nhiên liệu, Số chỗ, Giá/ngày).
   - Hiển thị trạng thái xe theo thời gian thực (Sẵn sàng / Đặt thuê / Bảo trì).
   - Kiểm tra hạn đăng kiểm (nếu xe hết hạn đăng kiểm sẽ tự động cảnh báo và khóa chức năng đặt xe).
   - Lịch biểu đặt xe (Booking Schedule): Xem trước các khoảng thời gian xe đã có khách đặt để tránh trùng lịch.

5. **Quy trình Đặt xe trực tuyến (Online Booking Flow)**:
   - Chọn **Ngày nhận xe** và **Ngày trả xe dự kiến**.
   - Chọn **Điểm đón xe** (Tích hợp xác thực địa chỉ hợp lệ tại khu vực Hà Nội).
   - Hệ thống tự động tính toán:
     + Số ngày thuê thực tế.
     + Tiền cọc (Deposit) yêu cầu.
     + Tổng số tiền dự kiến.
   - Kiểm tra xung đột lịch thuê (Booking conflict check): Ngăn chặn đặt trùng khoảng thời gian với hợp đồng khác.
   - Tải lên hình ảnh xác minh (CCCD, Bằng lái xe, Ảnh hiện trạng xe - tối đa 6 ảnh).
   - Tạo yêu cầu thuê xe với trạng thái ban đầu là `Chờ xác nhận`.

6. **Trang Xác nhận đặt xe (Booking Success / Confirmation)**:
   - Hiển thị tóm tắt mã hợp đồng vừa tạo (MaHD).
   - Hướng dẫn chuyển khoản tiền đặt cọc và phương thức liên hệ xác nhận với tổng đài.

7. **Tra cứu đơn thuê xe (Contract Lookup)**:
   - Tra cứu nhanh bằng: **Mã hợp đồng (MaHD)** HOẶC **Số điện thoại** HOẶC **Số CCCD**.
   - Xem chi tiết tiến độ hợp đồng (Chờ xác nhận → Đang hiệu lực → Đã hoàn thành).
   - Xem chi tiết bàn giao xe, phiếu trả xe, phí phạt vi phạm phát sinh (nếu có) và số tiền cần thanh toán còn lại.

8. **Đơn thuê của tôi (My Rentals)**:
   - Danh sách toàn bộ các hợp đồng thuê xe mà khách hàng đang đăng nhập đã thực hiện.
   - Xem nhanh trạng thái từng chuyến đi và lịch sử thuê xe.

9. **Trang Thông tin & Hỗ trợ**:
   - Trang Giới thiệu trung tâm (About Us).
   - Trang Hỏi đáp thường gặp (FAQ).
   - Form gửi thông tin liên hệ / khiếu nại / góp ý trực tiếp về hệ thống.

---

### PHÂN HỆ 2: DÀNH CHO QUẢN TRỊ VIÊN & NHÂN VIÊN (ADMIN / STAFF)

1. **Xác thực & Phân quyền nội bộ**:
   - Đăng nhập dành riêng cho Quản trị viên / Nhân viên (`Admin` / `Nhân viên`).
   - Phân quyền theo vai trò (Role-based Authorization):
     + `Admin`: Toàn quyền quản trị hệ thống, quản lý tài khoản nhân viên, cấu hình tham số, xóa dữ liệu xe.
     + `Nhân viên`: Xử lý nghiệp vụ hàng ngày (duyệt hợp đồng, lập phiếu trả xe, cập nhật đăng kiểm, bảo trì, hỗ trợ khách hàng).
   - Chức năng đổi mật khẩu tài khoản quản trị.

2. **Bảng điều khiển tổng quan (Dashboard)**:
   - **Thẻ chỉ số (KPI Stat Cards)**: Tổng số xe, số xe sẵn sàng, số xe đang cho thuê, số xe đang bảo dưỡng, tổng số khách hàng, tổng hợp đồng, hợp đồng đang chạy, doanh thu tháng.
   - **Biểu đồ doanh thu**: Thống kê doanh thu và số lượt thuê theo từng tháng trong năm (sử dụng Recharts).
   - **Biểu đồ cơ cấu đội xe**: Tỷ lệ phần trăm xe theo trạng thái (Sẵn sàng / Đang thuê / Bảo trì).
   - **Luồng hoạt động gần đây (Recent Activities)**: Nhật ký tạo hợp đồng, trả xe, bảo trì xe mới nhất.
   - **Trung tâm cảnh báo (Alert Center)**:
     + Danh sách xe **Sắp hết hạn đăng kiểm / Đã hết hạn đăng kiểm**.
     + Danh sách hợp đồng **Đến hạn trả xe / Quá hạn trả xe**.
     + Danh sách xe **Đang trong quá trình bảo trì**.

3. **Quản lý Đội xe (Car Fleet Management)**:
   - Danh sách xe với hình ảnh đại diện, biển số, loại xe, tình trạng hoạt động.
   - Thêm mới xe, cập nhật thông số xe, ghi chú tình trạng xe.
   - Tải lên và cập nhật hình ảnh xe trực tiếp (Upload Multer).
   - Tự động đồng bộ trạng thái xe khi có hợp đồng hiệu lực hoặc khi đưa xe vào xưởng bảo trì.
   - Xóa xe (chỉ dành cho tài khoản Admin).

4. **Quản lý Hợp đồng thuê xe (Contract Management)**:
   - Danh sách tất cả hợp đồng với bộ lọc theo trạng thái (`Chờ xác nhận`, `Đang hiệu lực`, `Đã hoàn thành`, `Đã hủy`).
   - Lập hợp đồng mới cho khách trực tiếp tại quầy.
   - Xem chi tiết hợp đồng, thông tin khách hàng, xe thuê, thời gian, điểm đón, ảnh giấy tờ bàn giao đính kèm.
   - **Duyệt hợp đồng**: Chuyển trạng thái từ `Chờ xác nhận` sang `Đang hiệu lực` -> Tự động kích hoạt trạng thái xe sang `Đang thuê`.
   - Chỉnh sửa thông tin hợp đồng, Hủy hợp đồng hoặc Xóa hợp đồng.

5. **Quản lý Trả xe & Quyết toán (Car Return Management)**:
   - Tạo phiếu trả xe (`TraXe`) khi khách bàn giao lại xe:
     + Ghi nhận ngày trả xe thực tế.
     + Đánh giá tình trạng xe lúc nhận lại (vết xước, mức nhiên liệu, vệ sinh,...).
     + Tự động tính số ngày thuê thực tế và số tiền thuê tương ứng.
     + Trừ tiền cọc ban đầu, tính toán số tiền còn lại khách phải trả hoặc số tiền trung tâm phải hoàn lại cọc.
     + Chọn phương thức thanh toán: Tiền mặt, Chuyển khoản, Momo, ZaloPay.
   - Khi hoàn thành phiếu trả xe:
     + Tự động chuyển trạng thái hợp đồng sang `Đã hoàn thành`.
     + Tự động đưa xe trở lại trạng thái `Sẵn sàng`.

6. **Quản lý Phí phạt & Xử lý vi phạm (Penalty Management)**:
   - Ghi nhận biên bản phạt phát sinh khi trả xe:
     + Loại vi phạm: `Phạt trả muộn`, `Phạt hỏng hóc`, `Cả trả muộn và hỏng hóc`.
     + Nhập số tiền phạt và ghi chú nguyên nhân chi tiết.
   - Tự động cộng tiền phạt vào tổng số tiền thanh toán cuối cùng của phiếu trả xe.

7. **Quản lý Đăng kiểm xe (Inspection Management)**:
   - Quản lý hạn kiểm định định kỳ của toàn bộ dàn xe.
   - Theo dõi ngày đăng kiểm gần nhất, ngày hết hạn đăng kiểm.
   - Phân loại trạng thái tự động: `Còn hạn`, `Sắp hết hạn` (dưới 30 ngày), `Hết hạn`.
   - Thêm hồ sơ đăng kiểm mới khi xe vừa được đi kiểm định lại.
   - Chặn tự động không cho phép đặt xe nếu xe đã quá hạn đăng kiểm.

8. **Quản lý Bảo trì & Sửa chữa (Maintenance Management)**:
   - Quản lý nhật ký bảo dưỡng định kỳ và sửa chữa hỏng hóc của xe.
   - Tạo phiếu bảo trì: Ngày bảo dưỡng, Nội dung chi tiết (thay dầu, thay lốp, đại tu máy,...), Chi phí bảo trì.
   - Cập nhật trạng thái bảo dưỡng: `Đang bảo trì` → `Hoàn thành`.
   - Tự động đồng bộ trạng thái xe sang `Bảo trì` khi mở phiếu và trả về `Sẵn sàng` khi bảo trì xong.

9. **Quản lý Khách hàng (Customer Management)**:
   - Quản lý danh sách toàn bộ khách hàng đã đăng ký tài khoản hoặc từng phát sinh giao dịch thuê xe.
   - Xem chi tiết hồ sơ: CCCD, Số điện thoại, Email, Địa chỉ, Số bằng lái xe.
   - Tra cứu toàn bộ lịch sử các hợp đồng thuê xe trước đây của khách hàng đó.

10. **Quản lý Nhân sự (Employee Management - Admin Only)**:
    - Quản lý danh sách nhân viên trung tâm.
    - Thêm tài khoản nhân viên mới, gán chức vụ (`Admin` hoặc `Nhân viên`).
    - Khóa tạm thời hoặc mở lại trạng thái hoạt động của nhân viên.

11. **Báo cáo tài chính & Hiệu quả kinh doanh (Reports & Analytics)**:
    - Báo cáo doanh thu & chi phí linh hoạt theo khoảng thời gian tùy chọn (Từ ngày - Đến ngày).
    - Phân tích chi tiết từng xe:
      + Số lượt cho thuê.
      + Doanh thu tiền thuê xe.
      + Chi phí bảo dưỡng/sửa chữa xe phát sinh.
      + Tiền thu từ các khoản phí phạt.
      + Lợi nhuận thực tế theo từng xe.
    - Thống kê tổng hợp toàn trung tâm: Tổng doanh thu, Tổng chi phí bảo trì, Tổng phí phạt, Doanh thu thuần.

12. **Cài đặt hệ thống (System Settings)**:
    - Cấu hình thông tin doanh nghiệp (Tên công ty, Hotline, Email liên hệ, Địa chỉ trụ sở hiển thị trên website/hợp đồng).
    - Cấu hình cảnh báo tự động: Bật/tắt thông báo qua email, cảnh báo đăng kiểm, cảnh báo hạn hợp đồng.
    - Tùy chỉnh số ngày cảnh báo trước hạn đăng kiểm (Ví dụ: trước 15 ngày, 30 ngày, 45 ngày).

13. **Quản lý Hộp thư Liên hệ (Contact Messages)**:
    - Danh sách câu hỏi, phản hồi từ khách hàng gửi qua form liên hệ.
    - Đánh dấu trạng thái xử lý (`Mới` → `Đã phản hồi`).

---

## IV. DANH SÁCH RESTful API ENDPOINTS HIỆN CÓ

| Nhóm API | Method | Endpoint | Quyền truy cập | Mô tả chức năng |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/customers/register` | Public | Đăng ký tài khoản khách hàng |
| | `POST` | `/api/auth/customers/login` | Public | Đăng nhập tài khoản khách hàng |
| | `POST` | `/api/auth/admin/login` | Public | Đăng nhập Quản trị viên / Nhân viên |
| | `GET` | `/api/auth/me` | Logged In | Lấy thông tin tài khoản phiên hiện tại |
| | `POST` | `/api/auth/logout` | Logged In | Đăng xuất |
| | `PATCH` | `/api/auth/admin/change-password` | Admin/Staff | Đổi mật khẩu tài khoản quản trị |
| **Cars** | `GET` | `/api/cars/featured` | Public | Lấy danh sách xe nổi bật trang chủ |
| | `GET` | `/api/cars` | Public | Lấy danh sách xe (kèm bộ lọc & tìm kiếm) |
| | `GET` | `/api/cars/:id` | Public | Lấy chi tiết xe & lịch đặt xe |
| | `POST` | `/api/cars` | Admin/Staff | Thêm xe mới vào hệ thống |
| | `PUT` | `/api/cars/:id` | Admin/Staff | Cập nhật thông tin xe |
| | `DELETE` | `/api/cars/:id` | Admin | Xóa xe khỏi hệ thống |
| | `POST` | `/api/cars/:id/image` | Admin/Staff | Upload ảnh đại diện cho xe |
| **Contracts** | `GET` | `/api/contracts/lookup` | Public | Tra cứu đơn thuê (theo MaHD/CCCD/SĐT) |
| | `GET` | `/api/contracts/my-rentals` | Customer | Lấy danh sách đơn thuê của khách đang login |
| | `GET` | `/api/contracts` | Admin/Staff | Lấy toàn bộ danh sách hợp đồng |
| | `GET` | `/api/contracts/:id` | Admin/Staff | Lấy chi tiết hợp đồng & ảnh bàn giao |
| | `POST` | `/api/contracts` | Public/Customer | Tạo đơn thuê xe mới (kèm upload ảnh giấy tờ) |
| | `PUT` | `/api/contracts/:id` | Admin/Staff | Cập nhật / Duyệt hợp đồng |
| | `PATCH` | `/api/contracts/:id/cancel` | Admin/Staff | Hủy hợp đồng thuê xe |
| | `DELETE` | `/api/contracts/:id` | Admin/Staff | Xóa hợp đồng |
| **Returns** | `GET` | `/api/returns` | Admin/Staff | Danh sách phiếu trả xe |
| | `GET` | `/api/returns/:id` | Admin/Staff | Chi tiết phiếu trả xe & biên bản phạt |
| | `POST` | `/api/returns` | Admin/Staff | Lập phiếu trả xe & quyết toán chi phí |
| | `PUT` | `/api/returns/:id` | Admin/Staff | Cập nhật phiếu trả xe |
| **Penalties** | `GET` | `/api/penalties` | Admin/Staff | Danh sách biên bản phạt |
| | `POST` | `/api/penalties` | Admin/Staff | Tạo biên bản phạt đính kèm phiếu trả xe |
| | `PUT` | `/api/penalties/:id` | Admin/Staff | Cập nhật biên bản phạt |
| | `DELETE` | `/api/penalties/:id` | Admin/Staff | Xóa biên bản phạt |
| **Inspections**| `GET` | `/api/inspections` | Admin/Staff | Danh sách hồ sơ đăng kiểm toàn bộ xe |
| | `POST` | `/api/inspections` | Admin/Staff | Thêm hồ sơ đăng kiểm mới |
| | `PUT` | `/api/inspections/:id` | Admin/Staff | Cập nhật thông tin đăng kiểm |
| **Maintenance**| `GET` | `/api/maintenance` | Admin/Staff | Danh sách hồ sơ bảo dưỡng / sửa chữa |
| | `POST` | `/api/maintenance` | Admin/Staff | Lập phiếu bảo trì xe |
| | `PUT` | `/api/maintenance/:id` | Admin/Staff | Cập nhật trạng thái hoàn thành bảo trì |
| **Customers** | `GET` | `/api/customers` | Admin/Staff | Danh sách khách hàng |
| | `GET` | `/api/customers/:id` | Admin/Staff | Chi tiết khách hàng & lịch sử thuê |
| | `PUT` | `/api/customers/:id` | Admin/Staff | Cập nhật thông tin khách hàng |
| **Employees** | `GET` | `/api/employees` | Admin Only | Danh sách nhân viên |
| | `POST` | `/api/employees` | Admin Only | Thêm nhân viên mới |
| | `PUT` | `/api/employees/:id` | Admin Only | Cập nhật nhân viên / Khóa tài khoản |
| **Dashboard** | `GET` | `/api/dashboard/summary` | Admin/Staff | Dữ liệu tổng quan KPI, biểu đồ doanh thu |
| | `GET` | `/api/dashboard/alerts` | Admin/Staff | Danh sách cảnh báo đăng kiểm, hạn trả xe |
| | `GET` | `/api/dashboard/revenue-report` | Admin/Staff | Báo cáo doanh thu & chi phí theo khoảng ngày |
| **Contacts** | `POST` | `/api/contacts` | Public | Gửi form liên hệ từ website/app |
| | `GET` | `/api/contacts` | Admin/Staff | Danh sách tin nhắn liên hệ |
| | `PATCH` | `/api/contacts/:id/status` | Admin/Staff | Cập nhật trạng thái xử lý liên hệ |
| **Settings** | `GET` | `/api/settings` | Public/Admin | Lấy thông tin cấu hình hệ thống |
| | `PUT` | `/api/settings` | Admin Only | Cập nhật cài đặt hệ thống & cảnh báo |

---

## V. KẾ HOẠCH TÁCH VÀ CHUYỂN ĐỔI (MIGRATION ARCHITECTURE)

Dựa trên yêu cầu:
1. **User (Khách hàng)**: Sử dụng **Mobile App (React Native)** để tìm xe, đặt xe, quản lý đơn và lịch sử thuê xe.
2. **Admin (Quản trị viên & Nhân sự)**: Sử dụng **Web Admin Portal (Next.js / React)** để quản lý toàn diện trung tâm.
3. **Backend API chung**: Cung cấp dữ liệu tập trung cho cả Mobile App và Web Admin.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 HỆ THỐNG CƠ SỞ DỮ LIỆU                 │
                  │                        (MySQL)                         │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                 BACKEND RESTful API                    │
                  │          (Node.js / Express.js / JWT Auth)             │
                  └───────────────┬────────────────────────┬───────────────┘
                                  │                        │
         (Khách hàng / End-user)  │                        │  (Admin / Nhân viên)
                                  ▼                        ▼
      ┌─────────────────────────────────────┐    ┌──────────────────────────────────┐
      │       REACT NATIVE MOBILE APP       │    │      WEB ADMIN MANAGEMENT        │
      │       (iOS & Android Platform)      │    │     (Next.js / React Web)        │
      ├─────────────────────────────────────┤    ├──────────────────────────────────┤
      │ • Đăng ký / Đăng nhập (JWT Token)   │    │ • Dashboard thống kê KPI doanh thu│
      │ • Xem danh sách xe & Lọc theo mẫu   │    │ • Quản lý đội xe & Upload hình ảnh│
      │ • Xem chi tiết xe & Lịch trống      │    │ • Duyệt & Quản lý Hợp đồng thuê  │
      │ • Đặt xe trực tuyến & Chọn điểm đón │    │ • Lập Phiếu trả xe & Quyết toán  │
      │ • Chụp ảnh CCCD / Bằng lái từ Camera│    │ • Quản lý Phí phạt & Vi phạm     │
      │ • Tra cứu hợp đồng & Lịch sử thuê   │    │ • Quản lý Đăng kiểm xe & Cảnh báo│
      │ • Quản lý hồ sơ cá nhân             │    │ • Quản lý Bảo trì / Sửa chữa     │
      │ • Nhận thông báo đẩy (Push Notif)   │    │ • Báo cáo tài chính chi tiết     │
      │ • Hỗ trợ & Liên hệ trực tuyến       │    │ • Quản trị nhân viên & Cài đặt   │
      └─────────────────────────────────────┘    └──────────────────────────────────┘
```

### 1. Kiến trúc phân hệ Mobile App (React Native - Expo / React Native CLI)
- **Màn hình chính cần triển khai**:
  - `Auth`: Đăng ký, Đăng nhập, Quên mật khẩu, Cập nhật hồ sơ bằng lái & CCCD.
  - `Home`: Banner ưu đãi, Top xe thịnh hành, Nút tìm xe nhanh, Cảnh báo hợp đồng đang thuê.
  - `Car Catalog & Filter`: Danh sách xe dạng lưới / thẻ card, bộ lọc theo giá, hãng xe, số ghế, loại hộp số/nhiên liệu.
  - `Car Detail`: Slide ảnh xe, bảng thông số, trạng thái sẵn sàng, xem lịch bận của xe, nút "Đặt xe ngay".
  - `Booking Flow`:
    + Chọn ngày nhận & ngày trả bằng DateTimePicker.
    + Chọn điểm đón (Tích hợp bản đồ hoặc nhập địa chỉ).
    + Chụp ảnh hoặc chọn từ thư viện: Ảnh 2 mặt CCCD, Bằng lái xe (Tận dụng Camera / ImagePicker của mobile).
    + Xác nhận thanh toán đặt cọc (Hiển thị mã QR VietQR / Momo chuyển khoản).
  - `My Rentals (Quản lý đơn thuê)`:
    + Danh sách chuyến đi: Đang chờ duyệt, Đang chạy, Đã hoàn thành, Đã hủy.
    + Chi tiết đơn: Thời gian, thông tin xe, số tiền cọc, số tiền còn lại, biên bản bàn giao.
  - `Lookup`: Màn hình tra cứu nhanh đơn thuê mà không cần đăng nhập (nhập MaHD / CCCD).
  - `Profile`: Thông tin cá nhân, cập nhật giấy tờ, đổi mật khẩu, trung tâm trợ giúp, hotline gọi điện trực tiếp.

### 2. Kiến trúc phân hệ Web Admin (Next.js / React)
- Giữ nguyên và tinh gọn từ thư mục `frontend/src/app/admin/` hiện tại, loại bỏ các trang public của khách hàng để Web trở thành **Dedicated Admin Dashboard**.
- Tối ưu giao diện cho màn hình máy tính bàn / laptop để nhân viên thao tác nhanh:
  - Bàn phím tắt, bảng dữ liệu nâng cao (Data Tables có phân trang, tìm kiếm, export Excel).
  - In ấn hóa đơn / hợp đồng thuê xe / phiếu trả xe dạng PDF.
  - Biểu đồ thống kê chuyên sâu với bộ lọc ngày tùy biến.

### 3. Nâng cấp khuyến nghị cho Backend API
- **Chuyển Authentication từ Session sang JWT (JSON Web Token)**:
  - Session cookie phù hợp cho web nhưng trên React Native Mobile App thì Bearer Token (JWT lưu trong `AsyncStorage` / `SecureStore`) sẽ ổn định và dễ xác thực hơn.
- **Thêm tính năng Push Notification**:
  - Tích hợp Firebase Cloud Messaging (FCM) hoặc Expo Push Notifications để gửi thông báo cho khách hàng khi hợp đồng được duyệt, sắp đến giờ nhận xe hoặc nhắc lịch trả xe.
- **Tích hợp Cổng thanh toán / VietQR**:
  - Sinh mã QR chuyển khoản tự động kèm nội dung `[MaHD]` để khách hàng thanh toán cọc dễ dàng trên mobile.
