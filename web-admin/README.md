# Web Admin - Cổng Quản Trị & Vận Hành Cho Thuê Xe (Next.js 14)

Ứng dụng Web dành riêng cho **Quản trị viên (`Admin`)** và **Nhân viên vận hành (`Nhân viên`)**, xây dựng bằng **Next.js 14 (App Router, Tailwind CSS, TypeScript)**.

## Cấu trúc thư mục

```
web-admin/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (admin)/         # Nhóm route bảo vệ yêu cầu đăng nhập
│   │   │   ├── dashboard/   # Trang tổng quan KPI và lưu lượng hợp đồng
│   │   │   ├── cars/        # Quản lý danh sách đội xe & trạng thái
│   │   │   ├── contracts/   # Quản lý & kiểm duyệt hợp đồng thuê xe
│   │   │   ├── customers/   # Quản lý danh bạ khách hàng & định danh
│   │   │   ├── employees/   # Quản lý tài khoản nhân viên nội bộ (Admin)
│   │   │   ├── settings/    # Cài đặt thông tin & ngưỡng cảnh báo
│   │   │   └── layout.tsx   # Layout chung có Sidebar + Header bảo vệ
│   │   ├── login/           # Trang đăng nhập quản trị
│   │   ├── globals.css      # CSS toàn cục & Tailwind
│   │   ├── layout.tsx       # Root Layout bao bọc AuthProvider
│   │   └── page.tsx         # Trang điều hướng ban đầu
│   ├── components/          # Reusable Components
│   │   ├── Sidebar.tsx      # Thanh điều hướng bên trái
│   │   ├── Header.tsx       # Header với thông tin người dùng & Đăng xuất
│   │   ├── StatCard.tsx     # Thẻ hiển thị chỉ số KPI
│   │   └── Badge.tsx        # Nhãn hiển thị trạng thái
│   ├── context/
│   │   └── AuthContext.tsx  # Quản lý Token JWT và trạng thái Admin
│   ├── services/            # Tầng gọi API Backend
│   │   ├── axiosClient.ts   # Axios đính kèm Bearer token từ localStorage
│   │   ├── authService.ts   # API đăng nhập admin, logout, đổi mật khẩu
│   │   ├── carService.ts    # API xe
│   │   ├── contractService.ts # API hợp đồng
│   │   ├── customerService.ts # API khách hàng
│   │   ├── dashboardService.ts# API dashboard thống kê
│   │   └── employeeService.ts # API nhân viên
│   └── types/               # TypeScript interfaces
├── next.config.mjs          # Cấu hình Next.js
├── tailwind.config.ts       # Cấu hình Tailwind CSS
├── tsconfig.json            # Cấu hình TypeScript
└── package.json
```

## Các tính năng chính (Tuần 1)

1. **Xác thực JWT Quản Trị**:
   - Đăng nhập phân quyền (`Admin` / `Nhân viên`) qua API `POST /api/auth/admin/login`.
   - Tự động gắn header `Authorization: Bearer <token>` vào tất cả request.
   - Tự động chuyển hướng về `/login` nếu phiên hết hạn hoặc không có quyền truy cập.

2. **Dashboard Vận Hành**:
   - Thống kê thời gian thực: Tổng số xe, xe sẵn sàng, xe đang cho thuê, xe bảo trì.
   - Theo dõi số lượng hợp đồng chờ xử lý và doanh thu tạm tính.
   - Bảng hợp đồng thuê mới nhất.

3. **Quản lý Đội Xe**:
   - Tìm kiếm xe theo tên xe, hãng xe, biển số.
   - Lọc xe theo trạng thái: *Sẵn sàng*, *Đang thuê*, *Bảo trì*.
   - Hiển thị thông số kỹ thuật (số chỗ, nhiên liệu, đời xe, đơn giá thuê).

4. **Quản lý Hợp Đồng & Duyệt Đơn**:
   - Danh sách toàn bộ đơn đặt xe từ Khách hàng gửi về từ Mobile App.
   - Thao tác nhanh: **Duyệt hợp đồng**, **Hủy hợp đồng**, **Xác nhận trả xe**.

5. **Danh bạ Khách Hàng & Nhân Viên**:
   - Tra cứu khách hàng theo CCCD, GPLX, số điện thoại.
   - Quản lý tài khoản nhân viên vận hành và phân quyền Admin.

## Hướng dẫn khởi chạy Web Admin

1. Cài đặt thư viện:
   ```bash
   cd web-admin
   npm install
   ```

2. Tạo file cấu hình môi trường `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Kiểm tra `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

3. Khởi chạy máy chủ phát triển Next.js:
   ```bash
   npm run dev
   ```
   Ứng dụng chạy tại: `http://localhost:3000`.
   - Tài khoản Admin mẫu: `admin@thuexe.vn` / Mật khẩu: `admin123` (hoặc tài khoản trong seed SQL).
