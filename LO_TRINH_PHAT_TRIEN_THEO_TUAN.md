# KẾ HOẠCH & BỘ PROMPT PHÁT TRIỂN THEO TUẦN (WEEKLY PROGRESSION ROADMAP)
### Dự án: Chuyển đổi Hệ thống Thuê xe sang Mobile App (React Native) & Web Admin (React/Next.js)
*(Giữ nguyên 100% Database MySQL và toàn bộ nghiệp vụ hiện tại)*

---

## 🎯 TỔNG QUAN CHIẾN LƯỢC NỘP MINH CHỨNG (GITHUB PROGRESSION)

Để phục vụ việc báo cáo tiến độ theo từng tuần với giảng viên/nhà trường:
1. **Database MySQL**: Giữ nguyên toàn bộ cấu trúc bảng và dữ liệu mẫu hiện tại.
2. **Backend**: Nâng cấp hỗ trợ JWT Authentication để vừa phục vụ Mobile App vừa phục vụ Web Admin.
3. **Phân chia nền tảng**:
   - **User (Khách hàng)**: Thao tác 100% trên **React Native Mobile App** (Expo / React Native CLI).
   - **Admin / Staff**: Thao tác 100% trên **Web Admin Portal** (Next.js / React).
4. **Lộ trình chia thành 6 tuần chuẩn**: Mỗi tuần đều có tính năng chạy được thực tế, mã nguồn hoàn chỉnh và mẫu Commit Message chuẩn mực để push lên GitHub.

---

## 📅 BẢNG TỔNG HỢP LỘ TRÌNH 6 TUẦN

| Tuần | Mục tiêu chính | Phân hệ thực hiện | Minh chứng commit GitHub |
|:---:|---|---|---|
| **Tuần 1** | Khởi tạo cấu trúc 3 phân hệ & Nâng cấp Backend JWT | Backend + Init App + Init Web | `feat(backend): upgrade auth to JWT for mobile & web`, `feat(init): setup react-native & web-admin projects` |
| **Tuần 2** | Auth & Xem danh mục xe trên Mobile App | React Native App | `feat(mobile): implement auth flow, car catalog and vehicle details` |
| **Tuần 3** | Luồng Đặt xe, Chụp ảnh CCCD & Quản lý đơn thuê | React Native App | `feat(mobile): implement booking flow with camera upload & rental history` |
| **Tuần 4** | Web Admin: Quản lý Đội xe, Đăng kiểm & Bảo trì | Web Admin Portal | `feat(admin): implement fleet management, inspection tracking & maintenance` |
| **Tuần 5** | Web Admin: Duyệt Hợp đồng, Lập phiếu Trả xe & Xử lý Phạt | Web Admin Portal | `feat(admin): implement contract approval, return process & penalty handling` |
| **Tuần 6** | Dashboard KPI, Báo cáo Doanh thu, Quản lý Nhân sự & Test E2E | Toàn hệ thống | `feat(admin): add dashboard charts, revenue reports, employee management & e2e testing` |

---

# CHI TIẾT PROMPT & HƯỚNG DẪN TỪNG TUẦN

---

## 🚀 TUẦN 1: TỔ CHỨC CẤU TRÚC DỰ ÁN & NÂNG CẤP BACKEND JWT API

### 🎯 Mục tiêu tuần 1:
- Giữ nguyên Database MySQL hiện tại (`schema.sql` và `seed.sql`).
- Nâng cấp Backend Express: Chuyển đổi từ `express-session` sang **JWT Token** (`jsonwebtoken`), tạo middleware xác thực Bearer token cho cả Mobile và Web.
- Tạo cấu trúc thư mục monorepo/multi-repo gồm 3 thư mục: `backend/`, `mobile-app/` (React Native Expo), `web-admin/` (Next.js).
- Viết API Client dùng chung (`axios`) xử lý token lưu trữ.

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 1:

```markdown
Chào bạn, tôi đang thực hiện Tuần 1 trong dự án "Hệ thống Quản lý Cho Thuê Xe".
Dự án sử dụng cơ sở dữ liệu MySQL hiện tại với các bảng: NhanVien, Xe, DangKiem, KhachHang, HopDongThue, AnhDatXe, TraXe, PhiPhat, BaoTri, LienHe, CaiDatHeThong.

Mục tiêu Tuần 1 của tôi là:
1. Cấu trúc lại repository thành 3 thư mục độc lập:
   - `backend/`: Node.js Express API.
   - `mobile-app/`: Ứng dụng React Native (dành cho Khách hàng).
   - `web-admin/`: Ứng dụng Web Next.js (dành cho Quản trị viên & Nhân viên).
2. Nâng cấp Backend:
   - Thêm thư viện `jsonwebtoken` (`npm i jsonwebtoken`).
   - Cập nhật `backend/controllers/auth.controller.js` và `backend/middlewares/auth.middleware.js` để tạo và xác thực Bearer JWT Token cho 2 phân quyền: `customer` (Khách hàng) và `admin`/`employee` (Quản trị viên/Nhân viên).
   - Đảm bảo các API hiện có (`/api/cars`, `/api/contracts`, `/api/auth`,...) vẫn giữ nguyên logic nghiệp vụ nhưng kiểm tra quyền thông qua Header `Authorization: Bearer <token>`.
3. Khởi tạo dự án `mobile-app/` bằng React Native (Expo SDK với TypeScript):
   - Cài đặt cấu trúc thư mục: `src/api`, `src/components`, `src/navigation`, `src/screens`, `src/context`, `src/constants`.
   - Thiết lập `axios` interceptor tự động gắn JWT Token từ `AsyncStorage`/`SecureStore`.
4. Khởi tạo dự án `web-admin/` bằng Next.js 14 (App Router, Tailwind CSS, TypeScript):
   - Cấu hình Axios Base URL và AuthContext quản lý Token Admin.

Hãy viết mã nguồn chi tiết và hướng dẫn các lệnh chạy để tôi kiểm tra và commit lên GitHub cho Tuần 1!
```

### 📌 Lệnh Git Commit tuần 1:
```bash
git add .
git commit -m "feat(arch): setup 3-tier structure, upgrade backend to JWT auth, init react-native and web-admin"
git push origin main
```

---

## 📱 TUẦN 2: XÂY DỰNG XÁC THỰC & KHÁM PHÁ DANH MỤC XE TRÊN REACT NATIVE

### 🎯 Mục tiêu tuần 2:
- **Mobile App**:
  - Xây dựng luồng Đăng ký & Đăng nhập tài khoản Khách hàng (Lưu token vào AsyncStorage).
  - Màn hình Trang chủ (Home Screen): Banner khuyến mãi, Danh sách xe nổi bật, Nút tìm xe nhanh.
  - Màn hình Danh sách xe (Car Catalog): Lưới danh sách xe, Tìm kiếm theo tên xe/hãng xe, Bộ lọc linh hoạt (hãng xe, loại xe sedan/SUV, 4/7 chỗ, loại nhiên liệu xăng/dầu/điện, khoảng giá thuê).
  - Màn hình Chi tiết xe (Car Details Screen): Slide ảnh xe, bảng thông số kỹ thuật, giá thuê, trạng thái xe (`Sẵn sàng` / `Đặt thuê` / `Bảo trì`), kiểm tra cảnh báo đăng kiểm, xem các khoảng ngày xe bận (`Booking schedules`).

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 2:

```markdown
Chào bạn, tiếp tục dự án "Hệ thống Quản lý Cho Thuê Xe", đây là Tuần 2 tập trung phát triển phân hệ Khách hàng trên React Native Mobile App.

Hãy lập trình các màn hình và chức năng sau trong thư mục `mobile-app/`:
1. Màn hình Auth (`src/screens/auth/`):
   - `LoginScreen.tsx`: Đăng nhập bằng Email và Mật khẩu, lưu JWT vào AsyncStorage, chuyển hướng sang App Navigation.
   - `RegisterScreen.tsx`: Đăng ký tài khoản khách hàng gồm Họ tên, SĐT, Email, Mật khẩu, CCCD, Địa chỉ, Số GPLX (Bằng lái).
   - `AuthContext.tsx`: Quản lý trạng thái đăng nhập, lưu thông tin user hiện tại.
2. Màn hình Trang chủ (`src/screens/home/HomeScreen.tsx`):
   - Header hiển thị lời chào và tên khách hàng.
   - Banner quảng bá dịch vụ.
   - Danh sách ngang "Xe nổi bật" (gọi API `GET /api/cars/featured`).
   - Nút dẫn nhanh sang tab Danh mục xe.
3. Màn hình Danh mục & Bộ lọc xe (`src/screens/cars/CarListScreen.tsx`):
   - Thanh tìm kiếm theo tên xe / biển số.
   - Thanh lọc nhanh theo Hãng xe (Toyota, Mazda, Kia, Honda, Hyundai, VinFast,...).
   - Modal / BottomSheet lọc nâng cao: Loại xe (Sedan, SUV,...), Số chỗ (4, 5, 7 chỗ), Nhiên liệu (Xăng, Dầu, Điện), Mức giá thuê/ngày.
   - Danh sách thẻ xe hiển thị ảnh, tên, giá/ngày, trạng thái Badge.
4. Màn hình Chi tiết xe (`src/screens/cars/CarDetailScreen.tsx`):
   - Hình ảnh xe to bản, thông tin hãng, năm sản xuất, biển số.
   - Cảnh báo nếu xe hết hạn đăng kiểm (vô hiệu hóa nút đặt xe).
   - Xem lịch đã được đặt trước của xe để khách biết tránh trùng ngày.
   - Nút "Đặt xe ngay" chuyển sang màn hình Booking.

Yêu cầu: Viết code TypeScript hoàn chỉnh, sử dụng React Navigation (Bottom Tabs + Native Stack), giao diện chuẩn UI/UX hiện đại, xử lý Loading và Error state đầy đủ.
```

### 📌 Lệnh Git Commit tuần 2:
```bash
git add .
git commit -m "feat(mobile): implement customer authentication, home dashboard, car catalog filtering and detail view"
git push origin main
```

---

## 🚗 TUẦN 3: LUỒNG ĐẶT XE, UPLOAD ẢNH TỪ CAMERA & QUẢN LÝ ĐƠN THUÊ

### 🎯 Mục tiêu tuần 3:
- **Mobile App**:
  - Màn hình Đặt xe (`BookingScreen`):
    + Chọn Ngày bắt đầu thuê & Ngày trả dự kiến (DateTimePicker).
    + Tự động tính số ngày thuê, tiền cọc (deposit), tổng chi phí tạm tính.
    + Nhập / chọn Điểm đón xe trong khu vực Hà Nội.
    + Tích hợp chụp ảnh hoặc chọn ảnh từ thư viện (`expo-image-picker` / `react-native-image-crop-picker`) để upload ảnh CCCD và Bằng lái xe (gọi API `POST /api/contracts` dạng `multipart/form-data`).
  - Màn hình Xác nhận đặt xe thành công (`BookingSuccessScreen`): Hiển thị mã hợp đồng và thông tin chuyển khoản đặt cọc.
  - Màn hình Lịch sử đơn thuê (`MyRentalsScreen`): Xem danh sách hợp đồng của khách hàng (gọi API `GET /api/contracts/my-rentals`).
  - Màn hình Tra cứu đơn thuê (`LookupScreen`): Tra cứu nhanh bằng Mã HĐ / CCCD / SĐT mà không cần đăng nhập.
  - Màn hình Chi tiết đơn thuê (`RentalDetailScreen`): Xem tiến trình hợp đồng, thông tin phiếu trả xe, phí phạt phát sinh nếu có.
  - Màn hình Tài khoản (`ProfileScreen`): Xem và cập nhật thông tin cá nhân, đăng xuất.

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 3:

```markdown
Chào bạn, tiếp tục dự án "Hệ thống Quản lý Cho Thuê Xe", đây là Tuần 3 để hoàn thiện toàn bộ luồng Khách hàng trên React Native Mobile App.

Hãy lập trình các màn hình và chức năng sau trong thư mục `mobile-app/`:
1. Màn hình Đặt xe (`src/screens/booking/BookingScreen.tsx`):
   - Chọn Ngày nhận xe và Ngày trả dự kiến (sử dụng DatePicker, validate ngày trả >= ngày nhận).
   - Tự động tính: Số ngày thuê, Tiền cọc (mặc định theo quy định hoặc % giá trị), Tổng số tiền dự kiến.
   - Nhập Điểm đón xe tại Hà Nội.
   - Form thông tin khách hàng (tự động điền thông tin từ tài khoản đã đăng nhập).
   - Mục Upload tài liệu: Sử dụng `expo-image-picker` để chụp ảnh hoặc chọn từ album (Ảnh mặt trước/sau CCCD, Giấy phép lái xe) - tối đa 6 ảnh.
   - Gửi yêu cầu đặt xe lên Backend qua API `POST /api/contracts` dạng `multipart/form-data` kèm token.
2. Màn hình Đặt xe thành công (`src/screens/booking/BookingSuccessScreen.tsx`):
   - Hiển thị Mã hợp đồng (MaHD), tóm tắt thông tin chuyến đi.
   - Hiển thị thông tin chuyển khoản ngân hàng (QR Code / Số tài khoản) để thanh toán tiền cọc.
3. Màn hình Đơn thuê của tôi (`src/screens/rentals/MyRentalsScreen.tsx`):
   - Tab chuyển đổi: "Tất cả", "Chờ xác nhận", "Đang thuê", "Đã hoàn thành", "Đã hủy".
   - Danh sách thẻ đơn thuê với trạng thái, ngày thuê, tên xe, tổng tiền.
4. Màn hình Chi tiết đơn thuê (`src/screens/rentals/RentalDetailScreen.tsx`):
   - Thông tin hợp đồng, tình trạng bàn giao xe, số tiền cọc, số tiền còn lại.
   - Nếu đã trả xe: hiển thị thông tin Phiếu trả xe, Biên bản phí phạt (nếu có vi phạm/trả muộn).
5. Màn hình Tra cứu độc lập (`src/screens/lookup/LookupScreen.tsx`):
   - Nhập Mã HĐ hoặc Số điện thoại / CCCD để tra cứu đơn thuê (gọi API `GET /api/contracts/lookup`).
6. Màn hình Cá nhân (`src/screens/profile/ProfileScreen.tsx`):
   - Hiển thị hồ sơ khách hàng, cập nhật thông tin giấy tờ, hotline liên hệ hỗ trợ, nút Đăng xuất.

Yêu cầu: Code hoàn chỉnh, xử lý upload ảnh FormData mượt mà trên React Native, hiển thị thông báo Alert/Toast khi đặt xe thành công.
```

### 📌 Lệnh Git Commit tuần 3:
```bash
git add .
git commit -m "feat(mobile): complete booking flow with camera upload, rental history tracking, lookup and user profile"
git push origin main
```

---

## 💻 TUẦN 4: XÂY DỰNG WEB ADMIN - QUẢN LÝ ĐỘI XE, ĐĂNG KIỂM & BẢO TRÌ

### 🎯 Mục tiêu tuần 4:
- **Web Admin Portal (Next.js / React Web)**:
  - Xây dựng Layout Admin: Sidebar, Header, Breadcrumb, Menu điều hướng, Xử lý Đăng nhập Admin/Nhân viên.
  - Phân hệ **Quản lý Đội xe (Cars Management)**:
    + Bảng danh sách xe kèm ảnh đại diện, biển số, loại xe, hãng xe, giá thuê, trạng thái (`Sẵn sàng`, `Đang thuê`, `Bảo trì`).
    + Modal/Trang Thêm mới xe, Chỉnh sửa thông tin xe, Tải lên ảnh xe (`POST /api/cars/:id/image`).
    + Chức năng Xóa xe (chỉ dành cho tài khoản có quyền `Admin`).
  - Phân hệ **Quản lý Đăng kiểm (Inspections)**:
    + Danh sách hồ sơ đăng kiểm toàn bộ xe.
    + Thẻ phân loại hạn: `Còn hạn` (Xanh), `Sắp hết hạn` (Vàng), `Hết hạn` (Đỏ).
    + Thêm mới / Cập nhật hồ sơ kiểm định khi xe được đăng kiểm lại.
  - Phân hệ **Quản lý Bảo trì & Sửa chữa (Maintenance)**:
    + Danh sách phiếu bảo dưỡng, ngày thực hiện, nội dung kỹ thuật, chi phí.
    + Tạo phiếu bảo trì xe → Tự động cập nhật trạng thái xe thành `Bảo trì`.
    + Đánh dấu hoàn thành bảo trì → Tự động chuyển trạng thái xe về `Sẵn sàng`.
  - Phân hệ **Cài đặt hệ thống (System Settings)**:
    + Cập nhật thông tin công ty, cấu hình số ngày cảnh báo đăng kiểm trước hạn.

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 4:

```markdown
Chào bạn, tiếp tục dự án "Hệ thống Quản lý Cho Thuê Xe", đây là Tuần 4 tập trung xây dựng giao diện Quản trị viên trên Web Admin (`web-admin/` bằng Next.js/React & Tailwind CSS).

Hãy lập trình các module sau cho Web Admin:
1. Layout & Xác thực Admin (`src/app/admin/` & `src/components/layout/`):
   - Màn hình Đăng nhập quản trị (`/auth/login`): Đăng nhập dành cho tài khoản Admin / Nhân viên, lưu token JWT vào Cookie/LocalStorage.
   - Sidebar cố định gồm các mục: Dashboard, Quản lý Xe, Hợp đồng thuê, Trả xe, Phí phạt, Đăng kiểm, Bảo trì, Khách hàng, Báo cáo, Nhân sự, Cài đặt.
   - Header hiển thị tên nhân viên, chức vụ (Admin/Nhân viên) và nút Đăng xuất.
2. Quản lý Đội xe (`src/app/admin/cars/`):
   - Bảng dữ liệu xe: Biển số, Tên xe, Hãng, Số chỗ, Nhiên liệu, Giá thuê/ngày, Trạng thái (Badge màu).
   - Bộ lọc theo trạng thái xe, hãng xe, ô tìm kiếm tên/biển số.
   - Dialog/Modal Thêm mới và Chỉnh sửa thông tin xe.
   - Upload ảnh xe trực tiếp qua API `POST /api/cars/:id/image`.
   - Nút Xóa xe có hộp thoại xác nhận (chỉ Admin mới có quyền xóa).
3. Quản lý Đăng kiểm xe (`src/app/admin/inspection/`):
   - Danh sách đăng kiểm của các xe: Ngày đăng kiểm, Ngày hết hạn, Trạng thái (`Còn hạn`, `Sắp hết hạn` <= 30 ngày, `Hết hạn`).
   - Form thêm mới / cập nhật kỳ đăng kiểm cho xe.
4. Quản lý Bảo trì / Sửa chữa (`src/app/admin/maintenance/`):
   - Danh sách phiếu bảo trì: Xe, Ngày bảo dưỡng, Nội dung chi tiết, Chi phí, Trạng thái (`Đang bảo trì` / `Hoàn thành`).
   - Form tạo phiếu bảo trì (tự động chuyển xe sang trạng thái 'Bảo trì').
   - Nút xác nhận hoàn thành (chuyển xe về trạng thái 'Sẵn sàng').
5. Cài đặt hệ thống (`src/app/admin/settings/`):
   - Cấu hình thông tin công ty (Tên, SĐT, Email, Địa chỉ) và số ngày cảnh báo đăng kiểm trước hạn.

Yêu cầu: Giao diện chuẩn Admin chuyên nghiệp, dùng Tailwind CSS + Radix UI/Shadcn UI, xử lý bảng dữ liệu, loading spinner, thông báo Toast thành công/thất bại rõ ràng.
```

### 📌 Lệnh Git Commit tuần 4:
```bash
git add .
git commit -m "feat(admin): implement admin layout, fleet management, inspection tracking, maintenance module and system settings"
git push origin main
```

---

## 📑 TUẦN 5: WEB ADMIN - QUẢN LÝ HỢP ĐỒNG, TRẢ XE, XỬ LÝ PHÍ PHẠT & KHÁCH HÀNG

### 🎯 Mục tiêu tuần 5:
- **Web Admin Portal**:
  - Phân hệ **Quản lý Hợp đồng (Contracts)**:
    + Xem danh sách tất cả đơn thuê gửi từ Khách hàng trên Mobile App.
    + Lọc theo trạng thái: `Chờ xác nhận`, `Đang hiệu lực`, `Đã hoàn thành`, `Đã hủy`.
    + Xem chi tiết hợp đồng, xem bộ ảnh CCCD/Bằng lái xe mà khách đã tải lên từ app.
    + Thao tác **Duyệt hợp đồng** (`Chờ xác nhận` → `Đang hiệu lực`) -> Tự động chuyển xe sang `Đang thuê`.
    + Tạo hợp đồng mới trực tiếp tại quầy cho khách vãng lai, Hủy hợp đồng, Chỉnh sửa hợp đồng.
  - Phân hệ **Quản lý Trả xe & Quyết toán (Returns)**:
    + Lập phiếu trả xe (`TraXe`): Ghi nhận ngày trả thực tế, đánh giá tình trạng xe nhận lại, tính số ngày thực tế và tổng tiền thuê.
    + Tự động trừ tiền cọc, tính số tiền khách cần trả thêm hoặc hoàn lại cọc.
    + Chọn hình thức thanh toán (Tiền mặt, Chuyển khoản, Momo, ZaloPay).
    + Hoàn tất trả xe: Tự động đổi trạng thái hợp đồng thành `Đã hoàn thành` và xe thành `Sẵn sàng`.
  - Phân hệ **Quản lý Phí phạt vi phạm (Penalties)**:
    + Lập biên bản phạt đính kèm phiếu trả xe: `Phạt trả muộn`, `Phạt hỏng hóc`, `Cả trả muộn và hỏng hóc`.
    + Nhập số tiền phạt, lý do chi tiết và tự động cộng vào tổng quyết toán.
  - Phân hệ **Quản lý Khách hàng (Customers)**:
    + Danh sách khách hàng đã đăng ký từ Mobile App, xem thông tin CCCD, GPLX, SĐT, Email.
    + Xem lịch sử tất cả các hợp đồng thuê xe của khách hàng.
  - Phân hệ **Quản lý Tin nhắn Liên hệ (Contacts)**:
    + Xem danh sách liên hệ từ khách hàng và đánh dấu `Đã phản hồi`.

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 5:

```markdown
Chào bạn, tiếp tục dự án "Hệ thống Quản lý Cho Thuê Xe", đây là Tuần 5 tập trung hoàn thiện các nghiệp vụ cốt lõi trên Web Admin (`web-admin/`).

Hãy lập trình các module sau:
1. Quản lý Hợp đồng thuê xe (`src/app/admin/contracts/`):
   - Danh sách toàn bộ hợp đồng thuê xe (tiếp nhận đơn đặt từ Mobile App).
   - Bộ lọc trạng thái: 'Chờ xác nhận', 'Đang hiệu lực', 'Đã hoàn thành', 'Đã hủy' và tìm kiếm theo khách hàng, biển số.
   - Xem chi tiết hợp đồng: Thời gian, tiền cọc, tổng tiền, điểm đón, xem Gallery ảnh giấy tờ/bằng lái của khách đính kèm.
   - Nút Duyệt hợp đồng (kích hoạt hiệu lực, xe chuyển sang 'Đang thuê').
   - Form tạo hợp đồng mới trực tiếp tại quầy và nút Hủy hợp đồng.
2. Quản lý Trả xe & Quyết toán (`src/app/admin/returns/`):
   - Danh sách các phiếu trả xe đã lập.
   - Modal Lập phiếu trả xe cho hợp đồng đang thuê:
     + Chọn hợp đồng cần trả.
     + Nhập ngày trả thực tế, ghi chú tình trạng xe lúc nhận lại.
     + Tự động tính toán: Số ngày thực tế, Tổng tiền thuê, Tiền cọc đã đóng, Số tiền còn lại cần thanh toán.
     + Chọn phương thức thanh toán: Tiền mặt, Chuyển khoản, Momo, ZaloPay.
     + Khi lưu phiếu trả xe: tự động cập nhật hợp đồng sang 'Đã hoàn thành' và xe về 'Sẵn sàng'.
3. Quản lý Phí phạt vi phạm (`src/app/admin/penalties/`):
   - Danh sách các biên bản phạt phát sinh.
   - Form thêm biên bản phạt gắn với phiếu trả xe (Loại phạt: Phạt trả muộn, Phạt hỏng hóc, Cả hai; Số tiền phạt; Ghi chú).
4. Quản lý Khách hàng (`src/app/admin/customers/`):
   - Bảng danh sách khách hàng: Họ tên, SĐT, Email, CCCD, Bằng lái, Địa chỉ.
   - Xem chi tiết hồ sơ khách hàng kèm danh sách lịch sử toàn bộ các chuyến thuê xe trước đây.
5. Quản lý Hộp thư Liên hệ (`src/app/admin/contacts/`):
   - Xem danh sách tin nhắn khách hàng gửi và cập nhật trạng thái 'Mới' -> 'Đã phản hồi'.

Yêu cầu: Viết code hoàn chỉnh, logic tính toán tài chính chính xác tuyệt đối, tích hợp đầy đủ API backend tương ứng.
```

### 📌 Lệnh Git Commit tuần 5:
```bash
git add .
git commit -m "feat(admin): implement contract approval workflow, car return and settlement, penalty handling, customer management and contact center"
git push origin main
```

---

## 📊 TUẦN 6: DASHBOARD KPI, BÁO CÁO DOANH THU, QUẢN TRỊ NHÂN SỰ & TEST E2E

### 🎯 Mục tiêu tuần 6:
- **Web Admin Portal**:
  - **Dashboard tổng quan**:
    + Thẻ KPI: Tổng xe, Xe sẵn sàng, Xe đang thuê, Xe bảo trì, Tổng khách hàng, Hợp đồng đang chạy, Doanh thu tháng.
    + Biểu đồ đường/cột Doanh thu theo tháng (Recharts).
    + Biểu đồ tròn Cơ cấu trạng thái đội xe.
    + Bảng thông báo Cảnh báo: Xe sắp/đã hết hạn đăng kiểm, Hợp đồng đến hạn/quá hạn trả xe.
  - **Báo cáo Tài chính & Doanh thu (Reports)**:
    + Chọn khoảng ngày (Từ ngày - Đến ngày).
    + Thống kê chi tiết theo từng xe: Số lượt cho thuê, Doanh thu tiền thuê, Chi phí bảo dưỡng, Thu tiền phạt, Lợi nhuận ròng.
    + Tổng hợp toàn trung tâm: Doanh thu, Chi phí, Thu phạt, Lợi nhuận thuần.
    + Hỗ trợ xuất dữ liệu ra file Excel hoặc in ấn báo cáo PDF.
  - **Quản lý Nhân sự (Employees - Admin Only)**:
    + Danh sách nhân viên, Thêm mới nhân viên, Gán vai trò (`Admin` hoặc `Nhân viên`), Khóa/Kích hoạt tài khoản.
- **Kiểm thử toàn diện liên thông (End-to-End Test)**:
  - Test luồng: Khách hàng đăng ký trên Mobile App → Đặt xe → Admin trên Web duyệt đơn → Khách nhận xe → Admin lập phiếu trả xe & quyết toán trên Web → Doanh thu cập nhật lên Dashboard.

---

### 📝 PROMPT COPY-PASTE CHO TUẦN 6:

```markdown
Chào bạn, đây là Tuần 6 - Tuần hoàn thiện cuối cùng của dự án "Hệ thống Quản lý Cho Thuê Xe" (Mobile App React Native + Web Admin Next.js).

Hãy lập trình các module sau để hoàn thiện dự án:
1. Dashboard Tổng quan (`src/app/admin/dashboard/`):
   - Thẻ thống kê KPI thời gian thực: Tổng số xe, Xe sẵn sàng, Xe đang thuê, Xe bảo dưỡng, Tổng khách hàng, Doanh thu tháng hiện tại.
   - Biểu đồ Doanh thu & Lượt thuê theo 12 tháng trong năm (dùng thư viện Recharts).
   - Biểu đồ Donut tỷ lệ phân bổ trạng thái xe.
   - Bảng Hoạt động gần đây và Trung tâm Cảnh báo (Đăng kiểm quá hạn, Hợp đồng đến hạn trả xe).
2. Báo cáo Tài chính & Kinh doanh (`src/app/admin/reports/`):
   - Bộ chọn khoảng thời gian (Từ ngày - Đến ngày).
   - Bảng phân tích chi tiết hiệu quả từng chiếc xe: Số lượt thuê, Doanh thu thuê xe, Chi phí bảo trì, Tiền thu phạt vi phạm, Lợi nhuận ròng.
   - Hàng tổng kết toàn trung tâm: Tổng doanh thu, Tổng chi phí, Tổng thu phạt, Lợi nhuận thuần.
   - Nút In báo cáo / Xuất file thống kê.
3. Quản lý Nhân viên (`src/app/admin/employees/` - Chỉ quyền Admin):
   - Danh sách nhân viên trung tâm, trạng thái Hoạt động/Tạm khóa.
   - Form thêm mới tài khoản nhân viên, phân quyền 'Admin' hoặc 'Nhân viên', chức năng Khóa/Mở khóa tài khoản.
4. Kiểm thử liên thông (E2E Integration):
   - Rà soát toàn bộ kết nối giữa Mobile App (React Native) và Web Admin (Next.js) qua Backend API.
   - Đảm bảo khi Khách đặt xe trên Mobile -> Đơn hiển thị ngay trên Web Admin -> Admin duyệt -> Xe chuyển 'Đang thuê' -> Trả xe -> Doanh thu hiển thị trên Dashboard.
5. Cập nhật README.md hướng dẫn cài đặt và chạy đồng thời cả 3 phân hệ: Backend, Mobile App và Web Admin.

Yêu cầu: Mã nguồn hoàn chỉnh, không lỗi cú pháp, sẵn sàng bàn giao và nghiệm thu dự án.
```

### 📌 Lệnh Git Commit tuần 6:
```bash
git add .
git commit -m "feat(system): finalize dashboard analytics, revenue reporting, employee management, e2e integration and documentation"
git push origin main
```

---

## 💡 MẸO & KINH NGHIỆM ĐỂ PUSH MINH CHỨNG ĐẠT ĐIỂM CAO

1. **Tần suất Commit đều đặn**: Mỗi tuần nên có từ 3 đến 5 commit nhỏ lẻ theo từng màn hình hoặc component trước khi có commit tổng kết tuần (ví dụ: `git commit -m "feat(mobile): add car detail screen with date picker"` rồi sau đó mới commit tổng tuần).
2. **Ảnh chụp màn hình (Screenshots)**: Ở mỗi tuần, hãy chụp lại 2-3 ảnh màn hình ứng dụng đang chạy (trên máy ảo Android/iOS hoặc trình duyệt) lưu vào thư mục `docs/screenshots/week-X/` để làm minh chứng trực quan trong báo cáo.
3. **Giữ nguyên Database**: Tuyệt đối không xóa các cột trong bảng SQL hiện tại để đảm bảo tính toàn vẹn dữ liệu từ đầu đến cuối dự án.
