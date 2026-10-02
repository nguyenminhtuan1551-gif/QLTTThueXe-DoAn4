const fs = require('fs');
const path = require('path');

console.log('Bắt đầu khởi tạo bộ dữ liệu mẫu lớn (~1000 bản ghi mỗi bảng)...');

// Helper random
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = (arr) => arr[rand(0, arr.length - 1)];
const pad = (num, size) => String(num).padStart(size, '0');

// Danh sách họ, đệm, tên Việt Nam phong phú
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn', 'Lâm', 'Mai', 'Trịnh'];
const DEM_NAM = ['Văn', 'Thanh', 'Quốc', 'Minh', 'Đức', 'Hữu', 'Gia', 'Hoàng', 'Quang', 'Tuấn', 'Tiến', 'Trọng', 'Bảo', 'Đình', 'Xuân'];
const TEN_NAM = ['An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hiếu', 'Hùng', 'Huy', 'Khoa', 'Long', 'Minh', 'Nam', 'Nghĩa', 'Phúc', 'Quân', 'Sơn', 'Thắng', 'Tùng', 'Việt', 'Khánh'];
const DEM_NU = ['Thị', 'Ngọc', 'Thanh', 'Phương', 'Mai', 'Thùy', 'Hải', 'Thu', 'Ánh', 'Diệu', 'Mỹ', 'Tuyết', 'Bích', 'Kim', 'Lan'];
const TEN_NU = ['Anh', 'Bình', 'Châu', 'Dung', 'Hà', 'Hằng', 'Hương', 'Lan', 'Linh', 'Mai', 'My', 'Nga', 'Ngân', 'Nhi', 'Oanh', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Uyên', 'Yến'];

function generateName() {
  const isMale = Math.random() > 0.45;
  const h = choice(HO);
  const d = isMale ? choice(DEM_NAM) : choice(DEM_NU);
  const t = isMale ? choice(TEN_NAM) : choice(TEN_NU);
  return `${h} ${d} ${t}`;
}

const VIETNAM_PROVINCES = [
  { city: 'Hà Nội', code: '30', districts: ['Quận Cầu Giấy', 'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Đống Đa', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Quận Thanh Xuân', 'Quận Tây Hồ', 'Quận Long Biên', 'Quận Hà Đông', 'Sân bay Nội Bài, Huyện Sóc Sơn'] },
  { city: 'TP. Hồ Chí Minh', code: '51', districts: ['Quận 1', 'Quận 3', 'Quận 7', 'Quận Tân Bình', 'Quận Bình Thạnh', 'TP. Thủ Đức', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Sân bay Tân Sơn Nhất, Quận Tân Bình'] },
  { city: 'Đà Nẵng', code: '43', districts: ['Quận Hải Châu', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Thanh Khê', 'Quận Cẩm Lệ', 'Sân bay Quốc tế Đà Nẵng'] },
  { city: 'Hải Phòng', code: '15', districts: ['Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Hải An', 'Huyện Thủy Nguyên'] },
  { city: 'Cần Thơ', code: '65', districts: ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng', 'Sân bay Quốc tế Cần Thơ'] },
  { city: 'Khánh Hòa', code: '79', districts: ['Thành phố Nha Trang (Lộc Thọ)', 'Thành phố Nha Trang (Vĩnh Hải)', 'Sân bay Cam Ranh'] },
  { city: 'Lâm Đồng', code: '49', districts: ['Thành phố Đà Lạt (Phường 1)', 'Thành phố Đà Lạt (Phường 2)', 'Thành phố Đà Lạt (Hồ Tuyền Lâm)'] },
  { city: 'Bà Rịa - Vũng Tàu', code: '72', districts: ['Thành phố Vũng Tàu (Bãi Trước)', 'Thành phố Vũng Tàu (Bãi Sau)', 'Thành phố Bà Rịa'] },
  { city: 'Quảng Ninh', code: '14', districts: ['Thành phố Hạ Long (Bãi Cháy)', 'Thành phố Hạ Long (Hòn Gai)', 'Thành phố Cẩm Phả'] },
  { city: 'Bình Dương', code: '61', districts: ['Thành phố Thủ Dầu Một', 'Thành phố Thuận An', 'Thành phố Dĩ An'] },
  { city: 'Đồng Nai', code: '60', districts: ['Thành phố Biên Hòa', 'Huyện Long Thành', 'Khu Công Nghiệp Amata'] },
  { city: 'Thừa Thiên Huế', code: '75', districts: ['Thành phố Huế (Phú Nhuận)', 'Thành phố Huế (Thuận Hòa)'] },
  { city: 'Kiên Giang', code: '68', districts: ['Thành phố Phú Quốc (Dương Đông)', 'Thành phố Phú Quốc (An Thới)', 'Thành phố Rạch Giá'] },
  { city: 'Nghệ An', code: '37', districts: ['Thành phố Vinh', 'Thị xã Cửa Lò'] },
  { city: 'Thanh Hóa', code: '36', districts: ['Thành phố Thanh Hóa', 'Thành phố Sầm Sơn'] },
];

function getRandomLocation() {
  const p = choice(VIETNAM_PROVINCES);
  const d = choice(p.districts);
  return {
    fullText: `${d}, ${p.city}`,
    provinceCode: p.code,
    city: p.city,
  };
}

// Danh sách các mẫu xe thực tế
const CAR_TEMPLATES = [
  { brand: 'Toyota', name: 'Toyota Camry 2.0Q', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 1400000 },
  { brand: 'Toyota', name: 'Toyota Vios G', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 800000 },
  { brand: 'Toyota', name: 'Toyota Corolla Cross 1.8V', type: 'Crossover', seats: 5, fuel: 'Xăng', basePrice: 1200000 },
  { brand: 'Toyota', name: 'Toyota Innova Cross Hybrid', type: 'MPV', seats: 7, fuel: 'Hybrid', basePrice: 1350000 },
  { brand: 'Toyota', name: 'Toyota Fortuner Legender', type: 'SUV', seats: 7, fuel: 'Dầu', basePrice: 1650000 },
  { brand: 'Hyundai', name: 'Hyundai Accent 1.5 AT', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 850000 },
  { brand: 'Hyundai', name: 'Hyundai Elantra N-Line', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 1100000 },
  { brand: 'Hyundai', name: 'Hyundai Tucson 2.0 HTRAC', type: 'SUV', seats: 5, fuel: 'Xăng', basePrice: 1450000 },
  { brand: 'Hyundai', name: 'Hyundai Santa Fe Calligraphy', type: 'SUV', seats: 7, fuel: 'Dầu', basePrice: 1750000 },
  { brand: 'Hyundai', name: 'Hyundai Custin 2.0T', type: 'MPV', seats: 7, fuel: 'Xăng', basePrice: 1600000 },
  { brand: 'Kia', name: 'Kia K3 Premium', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 950000 },
  { brand: 'Kia', name: 'Kia Seltos 1.5 Turbo', type: 'SUV', seats: 5, fuel: 'Xăng', basePrice: 1150000 },
  { brand: 'Kia', name: 'Kia Sorento Signature', type: 'SUV', seats: 7, fuel: 'Dầu', basePrice: 1650000 },
  { brand: 'Kia', name: 'Kia Carnival Signature', type: 'MPV', seats: 7, fuel: 'Dầu', basePrice: 1850000 },
  { brand: 'Mazda', name: 'Mazda 3 Luxury', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 1050000 },
  { brand: 'Mazda', name: 'Mazda 6 2.0 Premium', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 1300000 },
  { brand: 'Mazda', name: 'Mazda CX-5 Premium', type: 'SUV', seats: 5, fuel: 'Xăng', basePrice: 1350000 },
  { brand: 'Mazda', name: 'Mazda CX-8 Premium', type: 'SUV', seats: 7, fuel: 'Xăng', basePrice: 1600000 },
  { brand: 'Honda', name: 'Honda City RS', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 920000 },
  { brand: 'Honda', name: 'Honda Civic RS Turbo', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 1250000 },
  { brand: 'Honda', name: 'Honda CR-V e:HEV RS', type: 'SUV', seats: 7, fuel: 'Hybrid', basePrice: 1700000 },
  { brand: 'VinFast', name: 'VinFast VF 5 Plus', type: 'Crossover', seats: 5, fuel: 'Điện', basePrice: 750000 },
  { brand: 'VinFast', name: 'VinFast VF e34', type: 'Crossover', seats: 5, fuel: 'Điện', basePrice: 850000 },
  { brand: 'VinFast', name: 'VinFast VF 8 Plus', type: 'SUV', seats: 5, fuel: 'Điện', basePrice: 1900000 },
  { brand: 'VinFast', name: 'VinFast VF 9 Plus', type: 'SUV', seats: 7, fuel: 'Điện', basePrice: 2500000 },
  { brand: 'Mitsubishi', name: 'Mitsubishi Xpander Premium', type: 'MPV', seats: 7, fuel: 'Xăng', basePrice: 1100000 },
  { brand: 'Mitsubishi', name: 'Mitsubishi Xforce Ultimate', type: 'Crossover', seats: 5, fuel: 'Xăng', basePrice: 1150000 },
  { brand: 'Mitsubishi', name: 'Mitsubishi Pajero Sport', type: 'SUV', seats: 7, fuel: 'Dầu', basePrice: 1650000 },
  { brand: 'Ford', name: 'Ford Ranger Wildtrak', type: 'Bán tải', seats: 5, fuel: 'Dầu', basePrice: 1350000 },
  { brand: 'Ford', name: 'Ford Everest Titanium 4x4', type: 'SUV', seats: 7, fuel: 'Dầu', basePrice: 1750000 },
  { brand: 'Ford', name: 'Ford Transit 16 chỗ Luxury', type: 'MPV', seats: 16, fuel: 'Dầu', basePrice: 2100000 },
  { brand: 'Mercedes-Benz', name: 'Mercedes-Benz C300 AMG', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 2800000 },
  { brand: 'Mercedes-Benz', name: 'Mercedes-Benz E300 Exclusive', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 3500000 },
  { brand: 'BMW', name: 'BMW 320i M Sport', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 2600000 },
  { brand: 'BMW', name: 'BMW 520i M Sport', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 3100000 },
  { brand: 'Audi', name: 'Audi A6 45 TFSI', type: 'Sedan', seats: 5, fuel: 'Xăng', basePrice: 3300000 },
];

const CAR_IMAGES = [
  '/uploads/car/xe-01.jpg',
  '/uploads/car/xe-02.jpg',
  '/uploads/car/xe-03.jpg',
  '/uploads/car/xe-04.jpg',
  '/uploads/car/xe-05.jpg',
  '/uploads/car/xe-06.jpg',
  '/uploads/car/xe-07.jpg',
  '/uploads/car/xe-08.jpg',
  '/uploads/car/xe-09.jpg',
  '/uploads/car/xe-10.jpg',
  '/uploads/car/xe-11.jpg',
  '/uploads/car/xe-12.jpg',
  '/uploads/car/xe-13.jpg',
  '/uploads/car/xe-14.jpg',
  '/uploads/car/xe-15.jpg',
  '/uploads/car/xe-16.jpg',
  '/uploads/car/xe-17.jpg',
  '/uploads/car/xe-18.jpg',
  '/uploads/car/xe-19.jpg',
  '/uploads/car/xe-20.jpg',
];

const MAINTENANCE_TASKS = [
  'Thay dầu động cơ tổng hợp và lọc dầu chính hãng',
  'Bảo dưỡng hệ thống phanh 4 bánh, láng đĩa phanh',
  'Thay 2 lốp trước Michelin Primacy 4 và cân mâm bấm chì',
  'Vệ sinh giàn lạnh, khử khuẩn nội thất và nạp ga điều hòa',
  'Bảo dưỡng cấp lớn 4 vạn km theo tiêu chuẩn hãng',
  'Thay ắc quy khô GS 12V 65Ah',
  'Cân chỉnh độ chụm và góc đặt bánh xe điện tử',
  'Sơn dặm phục hồi vết xước cản sau và đánh bóng toàn xe',
  'Thay bugi Iridium và vệ sinh kim phun buồng đốt',
  'Kiểm tra phần mềm quản lý pin và hệ thống lái trợ lực điện',
];

const PENALTY_REASONS = [
  { type: 'Phạt trả muộn', note: 'Trả trễ 3 tiếng so với cam kết trong hợp đồng' },
  { type: 'Phạt trả muộn', note: 'Khách hàng trả trễ 1 ngày do lịch trình phát sinh' },
  { type: 'Phạt hỏng hóc', note: 'Vết xước sâu cản trước bên phụ cần phục hồi sơn' },
  { type: 'Phạt hỏng hóc', note: 'Làm rách thảm lót sàn khoang ghế sau' },
  { type: 'Phạt hỏng hóc', note: 'Nứt đèn sương mù bên lái do va quẹt nhẹ' },
  { type: 'Cả trả muộn và hỏng hóc', note: 'Trả muộn 6 tiếng và trầy xước cản sau khi lùi bãi' },
  { type: 'Cả trả muộn và hỏng hóc', note: 'Trả trễ 1 ngày kèm nội thất bẩn nhiều cần vệ sinh sâu' },
];

const CONTACT_MESSAGES = [
  'Tôi muốn thuê xe 7 chỗ tự lái đi công tác từ Hà Nội về Hải Phòng 3 ngày, xin báo giá trọn gói.',
  'Có hỗ trợ giao nhận xe tận sân bay Tân Sơn Nhất TP.HCM lúc 6h sáng không bạn?',
  'Công ty chúng tôi cần thuê xe Fortuner theo tháng tại Đà Nẵng, có xuất hóa đơn VAT không?',
  'Dịch vụ bàn giao xe rất đúng giờ, xe sạch sẽ và điều hòa mát mẻ. Rất hài lòng!',
  'Tôi muốn gia hạn thêm 2 ngày thuê xe tại Cần Thơ thì làm thủ tục như thế nào?',
  'Bên mình có dòng xe điện VinFast VF 8 để trải nghiệm cung đường Nha Trang - Đà Lạt không?',
  'Cần thuê xe 16 chỗ có tài xế đón đoàn khách sự kiện tại Vũng Tàu cuối tuần này.',
  'Góp ý thêm: nên mở rộng thêm nhiều điểm trả xe tại các quận trung tâm Hà Nội hơn nữa.',
  'Thủ tục nhận xe rất nhanh gọn, nhân viên thân thiện và tư vấn nhiệt tình.',
  'Cho hỏi tiền đặt cọc có được hoàn trả ngay sau khi kết thúc hợp đồng kiểm tra xe không?'
];

// GENERATION LOGIC
const generatedSql = [];

generatedSql.push(`USE web_thue_xe;`);
generatedSql.push(`SET NAMES utf8mb4;`);
generatedSql.push(`SET FOREIGN_KEY_CHECKS = 0;`);
generatedSql.push(`DELETE FROM CaiDatHeThong;`);
generatedSql.push(`DELETE FROM LienHe;`);
generatedSql.push(`DELETE FROM PhiPhat;`);
generatedSql.push(`DELETE FROM TraXe;`);
generatedSql.push(`DELETE FROM BaoTri;`);
generatedSql.push(`DELETE FROM AnhDatXe;`);
generatedSql.push(`DELETE FROM HopDongThue;`);
generatedSql.push(`DELETE FROM DangKiem;`);
generatedSql.push(`DELETE FROM KhachHang;`);
generatedSql.push(`DELETE FROM Xe;`);
generatedSql.push(`DELETE FROM NhanVien;`);
generatedSql.push(`DELETE FROM NguoiDung;`);
generatedSql.push(`ALTER TABLE LienHe AUTO_INCREMENT = 1;`);
generatedSql.push(`SET FOREIGN_KEY_CHECKS = 1;`);
generatedSql.push(`START TRANSACTION;`);

// 1. NGUOI DUNG (Tài khoản)
console.log('1. Sinh dữ liệu NguoiDung (~1120 tài khoản)...');
const usersData = [];

// Demo accounts
usersData.push("('ND_ADMIN01', 'admin@carhire.vn', 'admin123', 'Admin', 'admin', 'Đang hoạt động')");
usersData.push("('ND_ADMIN02', 'admin@thuexetudong.vn', '123456', 'Admin', 'admin', 'Đang hoạt động')");
usersData.push("('ND_NV001', 'nv1@thuexetudong.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động')");
usersData.push("('ND_KH001', 'khachhang1@gmail.com', '123456', 'Customer', 'customer', 'Đang hoạt động')");
usersData.push("('ND_KH002', 'khach01@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động')");

// 100 Staff accounts
for (let i = 2; i <= 100; i++) {
  const code = pad(i, 4);
  const role = i <= 10 ? 'Admin' : 'Nhân viên';
  const status = i > 95 ? 'Tạm khóa' : 'Đang hoạt động';
  usersData.push(`('ND_NV${code}', 'nhanvien${i}@thuexe.vn', '123456', '${role}', 'admin', '${status}')`);
}

// 1000 Customer accounts (ND_KH0003 -> ND_KH1002)
for (let i = 3; i <= 1002; i++) {
  const code = pad(i, 4);
  const status = i > 990 ? 'Tạm khóa' : 'Đang hoạt động';
  usersData.push(`('ND_KH${code}', 'khachhang${i}@gmail.com', '123456', 'Customer', 'customer', '${status}')`);
}

generatedSql.push(`INSERT INTO NguoiDung (MaND, TenDangNhap, MatKhau, VaiTro, PhanVung, TrangThai) VALUES\n  ${usersData.join(',\n  ')};`);

// 2. NHAN VIEN (100 nhân viên)
console.log('2. Sinh dữ liệu NhanVien (100 nhân viên)...');
const staffData = [];
staffData.push("('NV0001', 'ND_ADMIN01', 'Nguyễn Thanh Tùng', '0901112201', 'admin@carhire.vn', 'Admin', 'Đang hoạt động')");
staffData.push("('NV0002', 'ND_ADMIN02', 'Trần Quản Trị', '0901112202', 'admin@thuexetudong.vn', 'Admin', 'Đang hoạt động')");
staffData.push("('NV0003', 'ND_NV001', 'Lê Điều Phối', '0901112203', 'nv1@thuexetudong.vn', 'Nhân viên', 'Đang hoạt động')");

for (let i = 4; i <= 100; i++) {
  const code = pad(i, 4);
  const name = generateName();
  const phone = `090${rand(1000000, 9999999)}`;
  const email = `nhanvien${i}@thuexe.vn`;
  const role = i <= 10 ? 'Admin' : 'Nhân viên';
  const status = i > 95 ? 'Tạm khóa' : 'Đang hoạt động';
  staffData.push(`('NV${code}', 'ND_NV${code}', '${name}', '${phone}', '${email}', '${role}', '${status}')`);
}

generatedSql.push(`INSERT INTO NhanVien (MaNV, MaND, HoTen, SDT, Email, ChucVu, TrangThai) VALUES\n  ${staffData.join(',\n  ')};`);

// 3. KHACH HANG (1000 khách hàng)
console.log('3. Sinh dữ liệu KhachHang (1000 khách hàng)...');
const customerData = [];
customerData.push("('KH0001', 'ND_KH001', 'Nguyễn Văn An', '001201012345', '0909000001', 'khachhang1@gmail.com', '12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', 'B2-200001')");
customerData.push("('KH0002', 'ND_KH002', 'Trần Thị Bình', '790000000002', '0909000002', 'khach01@khachhang.vn', '87 Nguyễn Chí Thanh, Đống Đa, Hà Nội', 'B2-200002')");

for (let i = 3; i <= 1000; i++) {
  const code = pad(i, 4);
  const name = generateName();
  const cccd = `0${rand(10, 89)}${rand(100000000, 999999999)}`;
  const phone = `0${choice([9, 8, 3, 7])}${rand(10000000, 99999999)}`;
  const email = `khachhang${i}@gmail.com`;
  const loc = getRandomLocation();
  const address = `${rand(1, 299)} Đường ${choice(['Lê Lợi', 'Nguyễn Trãi', 'Trần Hưng Đạo', 'Quang Trung', 'Nguyễn Huệ', 'Võ Văn Kiệt', 'Cách Mạng Tháng 8', 'Điện Biên Phủ'])}, ${loc.fullText}`;
  const gplx = `${choice(['B1', 'B2', 'C'])}-${rand(100000, 999999)}`;
  customerData.push(`('KH${code}', 'ND_KH${code}', '${name}', '${cccd}', '${phone}', '${email}', '${address}', '${gplx}')`);
}

generatedSql.push(`INSERT INTO KhachHang (MaKH, MaND, HoTen, CCCD, SDT, Email, DiaChi, BangLai) VALUES\n  ${customerData.join(',\n  ')};`);

// 4. XE (1000 chiếc xe khắp các tỉnh thành)
console.log('4. Sinh dữ liệu Xe (1000 xe toàn quốc)...');
const carData = [];
const usedPlates = new Set();
const carList = [];

for (let i = 1; i <= 1000; i++) {
  const code = pad(i, 4);
  const carId = `XE${code}`;
  const tmpl = choice(CAR_TEMPLATES);
  const year = rand(2021, 2025);
  const price = tmpl.basePrice + rand(-1, 3) * 50000;
  const loc = getRandomLocation();

  let plate;
  do {
    const seriesChar = choice(['A', 'B', 'C', 'D', 'E', 'F', 'K', 'L']);
    plate = `${loc.provinceCode}${seriesChar}-${rand(100, 999)}.${pad(rand(1, 99), 2)}`;
  } while (usedPlates.has(plate));
  usedPlates.add(plate);

  // Phân bổ trạng thái: 75% Sẵn sàng, 15% Đang thuê, 10% Bảo trì
  const rStat = Math.random();
  const status = rStat < 0.75 ? 'Sẵn sàng' : rStat < 0.90 ? 'Đang thuê' : 'Bảo trì';
  const img = choice(CAR_IMAGES);
  const notes = `[Khu vực: ${loc.fullText}] Xe bảo dưỡng định kỳ, nội thất sạch sẽ, trang bị camera lùi và GPS`;

  carData.push(`('${carId}', '${plate}', '${tmpl.name} ${year}', '${tmpl.type}', '${tmpl.brand}', ${year}, ${price}, '${tmpl.fuel}', ${tmpl.seats}, '${status}', '${img}', '${notes}')`);
  carList.push({ id: carId, status, price, location: loc.fullText, plate });
}

generatedSql.push(`INSERT INTO Xe (MaXe, BienSo, TenXe, LoaiXe, HangXe, NamSanXuat, GiaThue, NhienLieu, SoCho, TrangThai, HinhAnh, GhiChu) VALUES\n  ${carData.join(',\n  ')};`);

// 5. DANG KIEM (1000 hồ sơ, 1 hồ sơ cho mỗi xe)
console.log('5. Sinh dữ liệu DangKiem (1000 hồ sơ)...');
const inspData = [];
for (let i = 1; i <= 1000; i++) {
  const code = pad(i, 4);
  const car = carList[i - 1];

  let status = 'Còn hạn';
  let expiryDate = `2027-${pad(rand(1, 12), 2)}-${pad(rand(1, 28), 2)}`;

  if (car.status === 'Đang thuê') {
    // Xe đang thuê luôn còn hạn
    status = 'Còn hạn';
    expiryDate = `2027-${pad(rand(3, 11), 2)}-${pad(rand(1, 28), 2)}`;
  } else if (car.status === 'Bảo trì') {
    const r = Math.random();
    if (r < 0.5) {
      status = 'Hết hạn';
      expiryDate = `2026-0${rand(1, 8)}-${pad(rand(1, 28), 2)}`;
    } else {
      status = 'Còn hạn';
    }
  } else {
    // Xe sẵn sàng: 90% còn hạn, 5% sắp hết hạn, 5% hết hạn
    const r = Math.random();
    if (r < 0.05) {
      status = 'Hết hạn';
      expiryDate = `2026-0${rand(1, 8)}-${pad(rand(1, 28), 2)}`;
    } else if (r < 0.10) {
      status = 'Sắp hết hạn';
      expiryDate = `2026-10-${pad(rand(5, 25), 2)}`;
    }
  }

  const inspDate = `2026-0${rand(1, 8)}-${pad(rand(1, 28), 2)}`;
  inspData.push(`('DK${code}', '${car.id}', '${inspDate}', '${expiryDate}', '${status}', 'Hồ sơ đăng kiểm định kỳ theo quy chuẩn Cục Đăng Kiểm')`);
}

generatedSql.push(`INSERT INTO DangKiem (MaDK, MaXe, NgayDK, HanDK, TrangThai, GhiChu) VALUES\n  ${inspData.join(',\n  ')};`);

// 6. HOP DONG THUE (1000 hợp đồng)
console.log('6. Sinh dữ liệu HopDongThue (1000 hợp đồng)...');
const contractData = [];
const contractList = [];

for (let i = 1; i <= 1000; i++) {
  const code = pad(i, 5);
  const contractId = `HD${code}`;
  const custId = `KH${pad(rand(1, 1000), 4)}`;
  const car = choice(carList);

  // Trạng thái hợp đồng
  // 75% Đã hoàn thành, 15% Đang hiệu lực, 5% Chờ xác nhận, 5% Đã hủy
  const rStat = Math.random();
  let status = 'Đã hoàn thành';
  let startMonth, startDay, duration;

  if (rStat < 0.75) {
    status = 'Đã hoàn thành';
    startMonth = rand(1, 8);
    startDay = rand(1, 24);
    duration = rand(2, 6);
  } else if (rStat < 0.90) {
    status = 'Đang hiệu lực';
    startMonth = 9;
    startDay = rand(25, 28);
    duration = rand(3, 7);
  } else if (rStat < 0.95) {
    status = 'Chờ xác nhận';
    startMonth = 10;
    startDay = rand(5, 12);
    duration = rand(2, 5);
  } else {
    status = 'Đã hủy';
    startMonth = rand(2, 9);
    startDay = rand(1, 20);
    duration = rand(2, 4);
  }

  const startDate = `2026-${pad(startMonth, 2)}-${pad(startDay, 2)}`;
  const endDay = startDay + duration;
  const endDate = `2026-${pad(startMonth, 2)}-${pad(Math.min(endDay, 28), 2)}`;
  const days = Math.max(1, duration);
  const total = days * car.price;
  const deposit = Math.round(total * 0.3);
  const pickup = `${rand(10, 500)} Đường ${choice(['Nguyễn Huệ', 'Lê Lợi', 'Hoàng Hoa Thám', 'Trần Hưng Đạo', 'Điện Biên Phủ', 'Võ Văn Kiệt'])}, ${car.location.replace(/\[Khu vực:\s*/, '').replace(/\]/, '')}`;
  const notes = choice([
    'Thuê xe có tài xế đưa đón đúng giờ',
    'Khách hàng yêu cầu xe sạch sẽ, có nước suối và khăn lạnh',
    'Chuyến công tác tỉnh, giao nhận xe tận nơi',
    'Gia đình đi du lịch nghỉ dưỡng cuối tuần',
    'Hợp đồng sự kiện tiếp đón khách đối tác doanh nghiệp',
  ]);

  contractData.push(`('${contractId}', '${custId}', '${car.id}', '${startDate}', '${endDate}', '${pickup}', ${deposit}, ${total}, '${status}', '${notes}')`);
  contractList.push({ id: contractId, custId, carId: car.id, startDate, endDate, total, deposit, days, status, pricePerDay: car.price });
}

generatedSql.push(`INSERT INTO HopDongThue (MaHD, MaKH, MaXe, NgayThue, NgayTraDuKien, DiemDon, TienCoc, TongTien, TrangThai, GhiChu) VALUES\n  ${contractData.join(',\n  ')};`);

// 7. TRA XE (Khoảng 750 phiếu trả xe cho các hợp đồng 'Đã hoàn thành')
console.log('7. Sinh dữ liệu TraXe (~750 phiếu)...');
const returnData = [];
const returnList = [];
let trxCount = 0;

contractList.forEach((c) => {
  if (c.status === 'Đã hoàn thành') {
    trxCount++;
    const code = pad(trxCount, 4);
    const returnId = `TRX${code}`;
    const actualDays = c.days + (Math.random() < 0.15 ? 1 : 0); // 15% trả trễ 1 ngày
    const totalRent = actualDays * c.pricePerDay;
    const remaining = Math.max(0, totalRent - c.deposit);
    const payMethod = choice(['Chuyển khoản', 'Tiền mặt', 'Momo', 'ZaloPay']);
    const cond = choice([
      'Xe bình thường, sạch sẽ, không trầy xước, đầy đủ phụ kiện',
      'Xe vận hành tốt, ngoại thất nguyên vẹn',
      'Đã vệ sinh nội thất, trả xe đúng giờ',
      'Xước nhẹ cản sau trong lúc lùi bãi',
      'Nội thất bẩn nhiều cần hút bụi và khử mùi',
    ]);
    const notes = actualDays > c.days ? 'Phát sinh trả trễ 1 ngày so với hợp đồng ban đầu' : 'Tất toán hoàn tất, bàn giao đầy đủ giấy tờ';

    returnData.push(`('${returnId}', '${c.id}', '${c.endDate}', '${cond}', ${actualDays}, ${totalRent}, ${c.deposit}, ${remaining}, ${remaining}, '${payMethod}', '${notes}')`);
    returnList.push({ id: returnId, contractId: c.id, hasDamage: cond.includes('Xước') || cond.includes('bẩn') || actualDays > c.days });
  }
});

generatedSql.push(`INSERT INTO TraXe (MaTraXe, MaHD, NgayTraXe, TinhTrangXe, SoNgayThueThucTe, TongTienThue, TienCoc, SoTienConLai, TongTienThanhToan, HinhThucThanhToan, GhiChu) VALUES\n  ${returnData.join(',\n  ')};`);

// 8. PHI PHAT (~250 biên bản phạt cho các xe trả có vi phạm)
console.log('8. Sinh dữ liệu PhiPhat (~250 biên bản)...');
const penaltyData = [];
let ppCount = 0;

returnList.forEach((r) => {
  if (r.hasDamage && ppCount < 250) {
    ppCount++;
    const code = pad(ppCount, 4);
    const pTemplate = choice(PENALTY_REASONS);
    const amount = rand(3, 15) * 100000; // 300k - 1.5 triệu
    penaltyData.push(`('PP${code}', '${r.id}', '${pTemplate.type}', ${amount}, '${pTemplate.note}')`);
  }
});

generatedSql.push(`INSERT INTO PhiPhat (MaPP, MaTraXe, LoaiPhiPhat, SoTienPhat, GhiChu) VALUES\n  ${penaltyData.join(',\n  ')};`);

// 9. BAO TRI (1000 phiếu bảo trì định kỳ & đột xuất)
console.log('9. Sinh dữ liệu BaoTri (1000 phiếu bảo trì)...');
const maintData = [];
for (let i = 1; i <= 1000; i++) {
  const code = pad(i, 4);
  const car = choice(carList);
  const task = choice(MAINTENANCE_TASKS);
  const cost = rand(6, 120) * 50000; // 300.000đ - 6.000.000đ
  const isDone = Math.random() < 0.85;
  const status = isDone ? 'Hoàn thành' : 'Đang bảo trì';

  const m = rand(1, 9);
  const d = rand(1, 24);
  const date = `2026-${pad(m, 2)}-${pad(d, 2)} ${pad(rand(8, 16), 2)}:00:00`;
  const compDate = isDone ? `'2026-${pad(m, 2)}-${pad(d + rand(0, 2), 2)}'` : 'NULL';

  maintData.push(`('BT${code}', '${car.id}', '${date}', ${compDate}, '${task}', ${cost}, '${status}')`);
}

generatedSql.push(`INSERT INTO BaoTri (MaBaoTri, MaXe, NgayBaoTri, NgayHoanThanh, NoiDung, ChiPhi, TrangThai) VALUES\n  ${maintData.join(',\n  ')};`);

// 10. LIEN HE (1000 tin nhắn hỗ trợ CSKH từ khách hàng toàn quốc)
console.log('10. Sinh dữ liệu LienHe (1000 tin nhắn CSKH)...');
const contactData = [];
for (let i = 1; i <= 1000; i++) {
  const name = generateName();
  const phone = `0${choice([9, 8, 3, 7])}${rand(10000000, 99999999)}`;
  const email = `lienhe${i}@gmail.com`;
  const msg = choice(CONTACT_MESSAGES);
  const status = Math.random() < 0.7 ? 'Đã phản hồi' : 'Mới';
  contactData.push(`('${name}', '${phone}', '${email}', '${msg}', '${status}')`);
}

generatedSql.push(`INSERT INTO LienHe (HoTen, SDT, Email, NoiDung, TrangThai) VALUES\n  ${contactData.join(',\n  ')};`);

// 11. ANH DAT XE (500 ảnh hồ sơ mẫu)
console.log('11. Sinh dữ liệu AnhDatXe...');
const imgData = [];
for (let i = 1; i <= 500; i++) {
  const code = pad(i, 4);
  const contractId = contractList[i % contractList.length].id;
  imgData.push(`('IMG${code}', '${contractId}', '/uploads/booking/sample_doc_${(i % 5) + 1}.jpg', 'cccd_gplx_mat_truoc_${code}.jpg')`);
}
generatedSql.push(`INSERT INTO AnhDatXe (MaAnh, MaHD, DuongDan, TenTep) VALUES\n  ${imgData.join(',\n  ')};`);

// 12. CAI DAT HE THONG
console.log('12. Cài đặt hệ thống...');
generatedSql.push(`INSERT INTO CaiDatHeThong (MaCaiDat, TenCongTy, SoDienThoai, EmailLienHe, DiaChi, ThongBaoEmail, CanhBaoDangKiem, CanhBaoHopDong, SoNgayCanhBaoDangKiem) VALUES
  (1, 'Hệ Thống Cho Thuê Xe Có Tài Xế Toàn Quốc', '1900 6868 - 0912 345 678', 'support@thuexetudong.vn', 'Số 10 Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội (Chi nhánh: TP.HCM, Đà Nẵng, Hải Phòng, Cần Thơ)', TRUE, TRUE, TRUE, 30);`);

generatedSql.push(`COMMIT;`);

const outputPath = path.join(__dirname, 'seed_1000.sql');
fs.writeFileSync(outputPath, generatedSql.join('\n\n'), 'utf8');

console.log(`\n🎉 THÀNH CÔNG! Đã tạo file seed quy mô lớn tại: ${outputPath}`);
console.log(`- Dung lượng file: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
console.log('- Đầy đủ 1000 xe, 1000 khách hàng, 1000 hợp đồng, 1000 đăng kiểm, 1000 bảo trì, 1000 liên hệ trên toàn quốc!');
