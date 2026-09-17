# Hệ Thống Quản Lý Cho Thuê Xe (Car Rental Management System)

Dự án phát triển hệ thống cho thuê xe ô tô tự lái và có tài xế tại khu vực Hà Nội theo kiến trúc 3 tầng độc lập (3-tier architecture).

---

## 🏗️ Cấu Trúc Tổng Thể Dự Án (Repository Structure)

```
React-Native/
├── backend/                 # Node.js + Express API (MVC, MySQL, JWT + Session)
│   ├── app.js
│   ├── bin/www
│   ├── common/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── uploads/
│
├── mobile-app/              # React Native Mobile App dành cho Khách Hàng (Expo SDK 54 + TypeScript)
│   ├── assets/
│   ├── src/
│   │   ├── api/             # Axios Interceptor tự động gắn Bearer Token
│   │   ├── components/      # Reusable UI (Button, Input, CarCard, Header, Badge,...)
│   │   ├── constants/       # Theme, Colors, Endpoints, Storage keys
│   │   ├── context/         # AuthContext (JWT Storage, Session sync)
│   │   ├── navigation/      # AuthStack, MainTabs, RootStack
│   │   ├── screens/         # Login, Register, Home, CarList, CarDetail, Booking, History, Profile
│   │   └── types/           # Type definitions
│   ├── App.tsx
│   └── app.json
│
└── web-admin/               # Web Next.js 14 dành cho Quản Trị Viên & Nhân Viên (App Router + Tailwind CSS)
    ├── src/
    │   ├── app/             # (admin)/dashboard, /cars, /contracts, /customers, /employees, /settings, /login
    │   ├── components/      # Sidebar, Header, StatCard, Badge
    │   ├── context/         # AuthContext (Admin JWT)
    │   ├── services/        # Axios API services
    │   └── types/           # Type definitions
    └── package.json
```

---

## 🚀 Hướng Dẫn Khởi Chạy (Quick Start)

### 1. Khởi chạy Backend (`backend/`)
```bash
cd backend
npm install
cp .env.example .env

# Import MySQL database (database/schema.sql & database/seed.sql)
# Chạy máy chủ backend:
npm run dev
# Server lắng nghe tại http://localhost:5000
```

### 2. Khởi chạy Web Admin (`web-admin/`)
```bash
cd web-admin
npm install
npm run dev
# Ứng dụng Web mở tại http://localhost:3000
```

### 3. Khởi chạy Mobile App (`mobile-app/`)
```bash
cd mobile-app
npm install
npm start
# Nhấn 'a' để mở Android Emulator hoặc quét mã QR qua Expo Go
```

---

## 🔐 Cơ Chế Xác Thực & Phân Quyền (JWT Authentication)

- **Bearer Token**: Cả Mobile App và Web Admin đều truyền token qua Header:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Phân quyền 2 nhóm người dùng**:
  - `Customer` (Khách hàng): Đăng nhập trên `mobile-app`, truy cập danh sách xe, đặt xe, xem lịch sử hợp đồng cá nhân.
  - `Admin` & `Nhân viên`: Đăng nhập trên `web-admin`, quản lý xe, duyệt và xử lý hợp đồng, danh bạ khách hàng, cấu hình hệ thống.
