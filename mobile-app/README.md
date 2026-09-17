# Mobile App - Ứng Dụng Khách Hàng Cho Thuê Xe (React Native / Expo)

Ứng dụng di động dành cho Khách hàng (`Customer`), phát triển bằng **React Native (Expo SDK 54 với TypeScript)**.

## Cấu trúc thư mục

```
mobile-app/
├── assets/                  # Icon, splash screen và hình ảnh tĩnh
├── src/
│   ├── api/                 # Axios client, interceptor JWT và các API endpoints
│   │   ├── axiosClient.ts   # Tự động đính kèm Bearer token từ AsyncStorage, bắt lỗi 401
│   │   ├── authApi.ts       # Đăng nhập, đăng ký, thông tin tài khoản, đăng xuất
│   │   ├── carApi.ts        # Danh sách xe, xe nổi bật, chi tiết xe
│   │   ├── contractApi.ts   # Tạo hợp đồng đặt xe, lịch sử thuê xe, tra cứu
│   │   └── contactApi.ts    # Gửi phản hồi, khiếu nại, yêu cầu hỗ trợ
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx       # Nút bấm với nhiều biến thể (primary, outline, danger)
│   │   ├── Input.tsx        # Ô nhập liệu có validation, ẩn/hiện mật khẩu
│   │   ├── CarCard.tsx      # Thẻ hiển thị thông tin và ảnh xe
│   │   ├── Header.tsx       # Thanh điều hướng đầu trang
│   │   ├── Badge.tsx        # Nhãn trạng thái hợp đồng, xe
│   │   ├── Loading.tsx      # Hiệu ứng chờ tải dữ liệu
│   │   └── EmptyState.tsx   # Trạng thái rỗng kèm nút hành động
│   ├── constants/           # Bảng màu, theme, cấu hình endpoint, storage keys
│   │   ├── colors.ts        # Bảng màu chuẩn
│   │   ├── config.ts        # Cấu hình BASE_URL theo nền tảng (Android/iOS)
│   │   ├── storageKeys.ts   # Khóa lưu trữ AsyncStorage
│   │   └── theme.ts         # Spacing, Radius, Typography, Shadows
│   ├── context/             # Quản lý trạng thái toàn cục
│   │   └── AuthContext.tsx  # Trạng thái đăng nhập, lưu token, refresh profile
│   ├── navigation/          # Điều hướng màn hình
│   │   ├── types.ts         # TypeScript ParamLists
│   │   ├── AuthNavigator.tsx# Điều hướng Đăng nhập / Đăng ký
│   │   ├── MainTabNavigator.tsx # Bottom Tabs: Trang chủ, Danh sách xe, Hợp đồng, Cá nhân
│   │   └── RootNavigator.tsx# Điều hướng tổng (Auth vs Main + Detail Modals)
│   ├── screens/             # Màn hình giao diện
│   │   ├── auth/            # LoginScreen, RegisterScreen
│   │   ├── home/            # HomeScreen
│   │   ├── car/             # CarListScreen, CarDetailScreen
│   │   ├── booking/         # BookingScreen, BookingHistoryScreen
│   │   └── profile/         # ProfileScreen
│   └── types/               # TypeScript interfaces (User, Car, Contract, API)
├── App.tsx                  # Điểm khởi chạy ứng dụng
├── app.json                 # Cấu hình Expo
├── package.json             # Danh sách dependencies
├── tsconfig.json            # Cấu hình TypeScript
└── babel.config.js          # Cấu hình Babel alias
```

## Các tính năng chính (Tuần 1)

1. **Xác thực JWT**:
   - Đăng nhập / Đăng ký tài khoản Khách hàng.
   - Tự động lưu `token` vào `AsyncStorage`.
   - `Axios Interceptor` tự động đính kèm `Authorization: Bearer <token>` vào tất cả request.
   - Tự động hủy phiên khi token hết hạn (401).

2. **Khám phá xe & Đặt xe**:
   - Trang chủ hiển thị xe nổi bật, phân loại xe nhanh theo số chỗ (4-5 chỗ, 7 chỗ), kiểu dáng (SUV, Sedan), nhiên liệu (Xăng, Điện).
   - Xem chi tiết thông số kỹ thuật, hình ảnh, đơn giá và chính sách thuê xe.
   - Form đặt xe: chọn ngày thuê, ngày trả, nhập địa chỉ nhận xe tại Hà Nội, đính kèm ảnh bàn giao / giấy tờ, tạm tính tiền cọc 30% và tổng giá trị.

3. **Lịch sử hợp đồng & Tra cứu**:
   - Xem danh sách các hợp đồng thuê xe của tài khoản theo trạng thái (Chờ xác nhận, Đang hiệu lực, Đã hoàn thành, Đã hủy).
   - Tra cứu nhanh hợp đồng qua mã hợp đồng.

4. **Tài khoản cá nhân**:
   - Xem thông tin CCCD, GPLX, địa chỉ, số điện thoại.
   - Gửi yêu cầu hỗ trợ trực tiếp đến hệ thống qua API Liên hệ.

## Hướng dẫn chạy ứng dụng

1. Cài đặt dependencies:
   ```bash
   cd mobile-app
   npm install
   ```

2. Cấu hình địa chỉ IP máy chủ Backend:
   - Mở file `src/constants/config.ts` hoặc tạo file `.env`:
     - Nếu chạy trên **Android Emulator**: sử dụng `http://10.0.2.2:5000/api`
     - Nếu chạy trên **iOS Simulator**: sử dụng `http://localhost:5000/api`
     - Nếu chạy trên **Điện thoại thật qua Expo Go**: sử dụng IP mạng LAN máy tính (ví dụ `http://192.168.1.50:5000/api`)

3. Khởi chạy Expo:
   ```bash
   npm start
   ```
   Hoặc:
   ```bash
   npm run android   # Chạy trên Android
   npm run ios       # Chạy trên iOS
   npm run web       # Chạy thử trên trình duyệt web
   ```
