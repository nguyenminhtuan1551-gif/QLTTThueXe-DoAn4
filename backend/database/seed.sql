USE web_thue_xe;
SET NAMES utf8mb4;

-- ========================================================
-- TÀI KHOẢN MẪU KHỞI TẠO:
-- Quản trị viên (Admin): admin@thuexetudong.vn / 123456 hoặc admin@carhire.vn / admin123
-- Nhân viên vận hành: nv1@thuexetudong.vn / 123456
-- Khách hàng: khachhang1@gmail.com / 123456 hoặc khach01@khachhang.vn / 123456
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM CaiDatHeThong;
DELETE FROM LienHe;
DELETE FROM PhiPhat;
DELETE FROM TraXe;
DELETE FROM BaoTri;
DELETE FROM AnhDatXe;
DELETE FROM HopDongThue;
DELETE FROM DangKiem;
DELETE FROM KhachHang;
DELETE FROM Xe;
DELETE FROM NhanVien;
DELETE FROM NguoiDung;
ALTER TABLE LienHe AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

-- 1. BẢNG TẬP TRUNG TÀI KHOẢN & MẬT KHẨU (NGUOIDUNG)
-- Password mặc định: '123456' hoặc 'admin123'
INSERT INTO NguoiDung (MaND, TenDangNhap, MatKhau, VaiTro, PhanVung, TrangThai) VALUES
  ('ND_ADMIN01', 'admin@carhire.vn', 'admin123', 'Admin', 'admin', 'Đang hoạt động'),
  ('ND_ADMIN02', 'admin@thuexetudong.vn', '123456', 'Admin', 'admin', 'Đang hoạt động'),
  ('ND_ADMIN03', 'mai.tran@carhire.vn', 'admin123', 'Admin', 'admin', 'Đang hoạt động'),
  ('ND_ADMIN04', 'phuc.le@carhire.vn', 'admin123', 'Admin', 'admin', 'Đang hoạt động'),
  ('ND_NV001', 'nv1@thuexetudong.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV002', 'dat.pham@carhire.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV003', 'khang.vo@carhire.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV004', 'lan.do@carhire.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV005', 'thu.bui@carhire.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV006', 'bao.dang@carhire.vn', '123456', 'Nhân viên', 'admin', 'Đang hoạt động'),
  ('ND_NV007', 'duc.hoang@carhire.vn', '123456', 'Nhân viên', 'admin', 'Tạm khóa'),
  ('ND_NV008', 'han.nguyen@carhire.vn', '123456', 'Nhân viên', 'admin', 'Tạm khóa'),
  ('ND_KH001', 'khachhang1@gmail.com', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH002', 'khach01@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH003', 'khach02@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH004', 'khach03@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH005', 'khach04@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH006', 'khach05@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH007', 'khach06@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH008', 'khach07@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH009', 'khach08@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH010', 'khach09@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động'),
  ('ND_KH011', 'khach10@khachhang.vn', '123456', 'Customer', 'customer', 'Đang hoạt động');

-- 2. BẢNG HỒ SƠ NHÂN VIÊN (NHANVIEN)
INSERT INTO NhanVien (MaNV, MaND, HoTen, SDT, Email, ChucVu, TrangThai) VALUES
  ('NV001', 'ND_ADMIN01', 'Nguyễn Thanh Tùng', '0901112201', 'admin@carhire.vn', 'Admin', 'Đang hoạt động'),
  ('NV002', 'ND_ADMIN03', 'Trần Thị Mai', '0901112202', 'mai.tran@carhire.vn', 'Admin', 'Đang hoạt động'),
  ('NV003', 'ND_ADMIN04', 'Lê Hoàng Phúc', '0901112203', 'phuc.le@carhire.vn', 'Admin', 'Đang hoạt động'),
  ('NV004', 'ND_NV002', 'Phạm Quốc Đạt', '0901112204', 'dat.pham@carhire.vn', 'Nhân viên', 'Đang hoạt động'),
  ('NV005', 'ND_NV003', 'Võ Minh Khang', '0901112205', 'khang.vo@carhire.vn', 'Nhân viên', 'Đang hoạt động'),
  ('NV006', 'ND_NV004', 'Đỗ Thị Lan', '0901112206', 'lan.do@carhire.vn', 'Nhân viên', 'Đang hoạt động'),
  ('NV007', 'ND_NV005', 'Bùi Anh Thu', '0901112207', 'thu.bui@carhire.vn', 'Nhân viên', 'Đang hoạt động'),
  ('NV008', 'ND_NV006', 'Đặng Gia Bảo', '0901112208', 'bao.dang@carhire.vn', 'Nhân viên', 'Đang hoạt động'),
  ('NV009', 'ND_NV007', 'Hoàng Minh Đức', '0901112209', 'duc.hoang@carhire.vn', 'Nhân viên', 'Tạm khóa'),
  ('NV010', 'ND_NV008', 'Nguyễn Gia Hân', '0901112210', 'han.nguyen@carhire.vn', 'Nhân viên', 'Tạm khóa');

-- 3. BẢNG PHƯƠNG TIỆN (XE)
INSERT INTO Xe (MaXe, BienSo, TenXe, LoaiXe, HangXe, NamSanXuat, GiaThue, NhienLieu, SoCho, TrangThai, HinhAnh, GhiChu) VALUES
  ('XE001', '30K-120.01', 'Toyota Camry 2.0Q 2023', 'Sedan', 'Toyota', 2023, 1400000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-01.jpg', '[Khu vực: Quận Cầu Giấy, Hà Nội] Sedan phục vụ khách doanh nghiệp'),
  ('XE002', '30K-120.02', 'Hyundai Accent 1.5 AT 2024', 'Sedan', 'Hyundai', 2024, 900000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-02.jpg', '[Khu vực: Quận Nam Từ Liêm, Hà Nội] Tiết kiệm nhiên liệu'),
  ('XE003', '30K-120.03', 'Kia K3 Premium 2023', 'Sedan', 'Kia', 2023, 950000, 'Xăng', 5, 'Đang thuê', '/uploads/car/xe-03.jpg', '[Khu vực: Quận Đống Đa, Hà Nội] Đang chạy hợp đồng nội đô'),
  ('XE004', '30K-120.04', 'Mazda 3 Luxury 2024', 'Sedan', 'Mazda', 2024, 1050000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-04.jpg', '[Khu vực: Quận Ba Đình, Hà Nội] Nội thất da màu kem'),
  ('XE005', '30K-120.05', 'Toyota Vios G 2022', 'Sedan', 'Toyota', 2022, 800000, 'Xăng', 5, 'Bảo trì', '/uploads/car/xe-05.jpg', '[Khu vực: Quận Cầu Giấy, Hà Nội] Đang bảo trì hệ thống phanh'),
  ('XE006', '30K-120.06', 'Honda City RS 2024', 'Sedan', 'Honda', 2024, 920000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-06.jpg', '[Khu vực: Quận Thanh Xuân, Hà Nội] Mới chạy 6.000 km'),
  ('XE007', '30K-120.07', 'Mitsubishi Xpander 2024', 'MPV', 'Mitsubishi', 2024, 1100000, 'Xăng', 7, 'Đang thuê', '/uploads/car/xe-07.jpg', '[Khu vực: Quận Nam Từ Liêm, Hà Nội] Phù hợp gia đình 7 chỗ'),
  ('XE008', '30K-120.08', 'Toyota Innova Cross 2024', 'MPV', 'Toyota', 2024, 1350000, 'Hybrid', 7, 'Sẵn sàng', '/uploads/car/xe-08.jpg', '[Khu vực: Quận Hà Đông, Hà Nội] Bản hybrid tiết kiệm'),
  ('XE009', '30K-120.09', 'Kia Carnival Signature 2023', 'MPV', 'Kia', 2023, 1800000, 'Dầu', 7, 'Bảo trì', '/uploads/car/xe-09.jpg', '[Khu vực: Quận Hoàn Kiếm, Hà Nội] Đang xử lý điều hòa sau'),
  ('XE010', '30K-120.10', 'Hyundai Custin 2.0T 2024', 'MPV', 'Hyundai', 2024, 1600000, 'Xăng', 7, 'Sẵn sàng', '/uploads/car/xe-10.jpg', '[Khu vực: Quận Tây Hồ, Hà Nội] Ghế captain seat'),
  ('XE011', '30K-120.11', 'Ford Everest Titanium 2023', 'SUV', 'Ford', 2023, 1700000, 'Dầu', 7, 'Đang thuê', '/uploads/car/xe-11.jpg', '[Khu vực: Quận Cầu Giấy, Hà Nội] Có camera 360'),
  ('XE012', '30K-120.12', 'Toyota Fortuner Legender 2024', 'SUV', 'Toyota', 2024, 1650000, 'Dầu', 7, 'Sẵn sàng', '/uploads/car/xe-12.jpg', '[Khu vực: Sân bay Nội Bài, Sóc Sơn, Hà Nội] Máy dầu 2.8'),
  ('XE013', '30K-120.13', 'Hyundai Tucson 2024', 'SUV', 'Hyundai', 2024, 1450000, 'Xăng', 5, 'Bảo trì', '/uploads/car/xe-13.jpg', '[Khu vực: Quận Long Biên, Hà Nội] Đang thay bộ lốp mới'),
  ('XE014', '30K-120.14', 'Kia Seltos 1.5 Turbo 2024', 'SUV', 'Kia', 2024, 1150000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-14.jpg', '[Khu vực: Quận Hai Bà Trưng, Hà Nội] Bản cao cấp'),
  ('XE015', '30K-120.15', 'Mazda CX-5 Premium 2023', 'SUV', 'Mazda', 2023, 1350000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-15.jpg', '[Khu vực: Quận Đống Đa, Hà Nội] Camera 360 đầy đủ'),
  ('XE016', '30K-120.16', 'Honda CR-V e:HEV RS 2024', 'SUV', 'Honda', 2024, 1700000, 'Hybrid', 7, 'Sẵn sàng', '/uploads/car/xe-16.jpg', '[Khu vực: Quận Ba Đình, Hà Nội] Bản hybrid tiết kiệm'),
  ('XE017', '30K-120.17', 'VinFast VF 8 Plus 2024', 'SUV', 'VinFast', 2024, 1900000, 'Điện', 5, 'Bảo trì', '/uploads/car/xe-17.jpg', '[Khu vực: Quận Nam Từ Liêm, Hà Nội] Đang chờ cập nhật phần mềm pin'),
  ('XE018', '30K-120.18', 'Mercedes-Benz C300 AMG 2023', 'Luxury', 'Mercedes-Benz', 2023, 2800000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-18.jpg', '[Khu vực: Quận Hoàn Kiếm, Hà Nội] Xe cao cấp cho sự kiện'),
  ('XE019', '30K-120.19', 'BMW 520i M Sport 2022', 'Luxury', 'BMW', 2022, 3000000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-19.jpg', '[Khu vực: Quận Tây Hồ, Hà Nội] Ngoại thất đen sapphire'),
  ('XE020', '30K-120.20', 'Audi A6 45 TFSI 2023', 'Luxury', 'Audi', 2023, 3200000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-20.jpg', '[Khu vực: Quận Cầu Giấy, Hà Nội] Nội thất nâu gỗ óc chó');

-- 4. BẢNG ĐĂNG KIỂM (DANGKIEM)
INSERT INTO DangKiem (MaDK, MaXe, NgayDK, HanDK, TrangThai, GhiChu) VALUES
  ('DK001', 'XE001', '2026-05-15', '2027-05-15', 'Còn hạn', 'Theo dõi định kỳ tại trung tâm Mỹ Đình'),
  ('DK002', 'XE002', '2026-06-01', '2027-06-01', 'Còn hạn', 'Hồ sơ đầy đủ'),
  ('DK003', 'XE003', '2026-04-10', '2027-04-10', 'Còn hạn', 'Đang phục vụ hợp đồng thuê xe'),
  ('DK004', 'XE004', '2026-04-20', '2027-04-20', 'Còn hạn', 'Không có lưu ý đặc biệt'),
  ('DK005', 'XE005', '2024-12-10', '2025-12-10', 'Hết hạn', 'Đang bảo trì nên chưa đi đăng kiểm lại'),
  ('DK006', 'XE006', '2026-07-05', '2027-07-05', 'Còn hạn', 'Xe vận hành ổn định'),
  ('DK007', 'XE007', '2026-03-15', '2027-03-15', 'Còn hạn', 'Đang phục vụ hợp đồng thuê xe'),
  ('DK008', 'XE008', '2026-06-18', '2027-06-18', 'Còn hạn', 'Đăng kiểm đúng lịch'),
  ('DK009', 'XE009', '2025-09-01', '2026-09-01', 'Hết hạn', 'Đang bảo trì điều hòa sau'),
  ('DK010', 'XE010', '2026-07-01', '2027-07-01', 'Còn hạn', 'Không phát sinh lỗi'),
  ('DK011', 'XE011', '2026-05-05', '2027-05-05', 'Còn hạn', 'Đang phục vụ hợp đồng thuê xe'),
  ('DK012', 'XE012', '2026-08-25', '2027-08-25', 'Còn hạn', 'Không có lỗi phát sinh'),
  ('DK013', 'XE013', '2025-04-12', '2026-04-25', 'Hết hạn', 'Đang thay bộ lốp mới'),
  ('DK014', 'XE014', '2026-08-28', '2027-08-28', 'Còn hạn', 'Theo dõi đúng hạn'),
  ('DK015', 'XE015', '2026-09-01', '2027-09-01', 'Còn hạn', 'Hồ sơ đạt tiêu chuẩn'),
  ('DK016', 'XE016', '2026-08-05', '2027-08-05', 'Còn hạn', 'Xe còn hạn dài'),
  ('DK017', 'XE017', '2025-03-18', '2026-03-18', 'Hết hạn', 'Đang bảo trì phần mềm pin'),
  ('DK018', 'XE018', '2026-07-20', '2027-07-20', 'Còn hạn', 'Xe cao cấp cho sự kiện'),
  ('DK019', 'XE019', '2026-06-30', '2027-06-30', 'Còn hạn', 'Đã hoàn thành kiểm tra khí thải'),
  ('DK020', 'XE020', '2026-08-14', '2027-08-14', 'Còn hạn', 'Lịch đăng kiểm ổn định');

-- 5. BẢNG HỒ SƠ KHÁCH HÀNG (KHACHHANG)
INSERT INTO KhachHang (MaKH, MaND, HoTen, CCCD, SDT, Email, DiaChi, BangLai) VALUES
  ('KH001', 'ND_KH001', 'Nguyễn Văn An', '001201012345', '0909000001', 'khachhang1@gmail.com', '12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', 'B2-200001'),
  ('KH002', 'ND_KH002', 'Trần Thị Bình', '790000000002', '0909000002', 'khach01@khachhang.vn', '87 Nguyễn Chí Thanh, Đống Đa, Hà Nội', 'B2-200002'),
  ('KH003', 'ND_KH003', 'Lê Minh Châu', '790000000003', '0909000003', 'khach02@khachhang.vn', '45 Lò Đúc, Hai Bà Trưng, Hà Nội', 'B2-200003'),
  ('KH004', 'ND_KH004', 'Phạm Hoàng Dũng', '790000000004', '0909000004', 'khach03@khachhang.vn', '18 Trần Duy Hưng, Cầu Giấy, Hà Nội', 'B2-200004'),
  ('KH005', 'ND_KH005', 'Võ Gia Hân', '790000000005', '0909000005', 'khach04@khachhang.vn', '92 Lạc Long Quân, Tây Hồ, Hà Nội', 'B2-200005'),
  ('KH006', 'ND_KH006', 'Đặng Quốc Huy', '790000000006', '0909000006', 'khach05@khachhang.vn', '101 Nguyễn Văn Cừ, Long Biên, Hà Nội', 'B2-200006'),
  ('KH007', 'ND_KH007', 'Bùi Thanh Lâm', '790000000007', '0909000007', 'khach06@khachhang.vn', '25 Quang Trung, Hà Đông, Hà Nội', 'B2-200007'),
  ('KH008', 'ND_KH008', 'Nguyễn Thị My', '790000000008', '0909000008', 'khach07@khachhang.vn', '66 Khuất Duy Tiến, Thanh Xuân, Hà Nội', 'B2-200008'),
  ('KH009', 'ND_KH009', 'Trần Đức Nam', '790000000009', '0909000009', 'khach08@khachhang.vn', '200 Minh Khai, Hai Bà Trưng, Hà Nội', 'B2-200009'),
  ('KH010', 'ND_KH010', 'Lê Ngọc Oanh', '790000000010', '0909000010', 'khach09@khachhang.vn', '11 Tôn Đức Thắng, Đống Đa, Hà Nội', 'B2-200010'),
  ('KH011', 'ND_KH011', 'Phan Quang Phúc', '790000000011', '0909000011', 'khach10@khachhang.vn', '30 Võ Chí Công, Tây Hồ, Hà Nội', 'B2-200011');

-- 6. BẢNG HỢP ĐỒNG THUÊ (HOPDONGTHUE)
INSERT INTO HopDongThue (MaHD, MaKH, MaXe, NgayThue, NgayTraDuKien, DiemDon, TienCoc, TongTien, TrangThai, GhiChu) VALUES
  ('HD001', 'KH001', 'XE001', '2026-01-03', '2026-01-06', '12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', 1500000, 5600000, 'Đã hoàn thành', 'Thu phí vệ sinh nội thất sau chuyến đi'),
  ('HD002', 'KH002', 'XE002', '2026-01-05', '2026-01-09', '87 Nguyễn Chí Thanh, Đống Đa, Hà Nội', 1200000, 4500000, 'Đã hoàn thành', 'Khách trả trễ 1 ngày do kẹt lịch'),
  ('HD003', 'KH003', 'XE004', '2026-01-08', '2026-01-10', '45 Lò Đúc, Hai Bà Trưng, Hà Nội', 1000000, 3150000, 'Đã hoàn thành', 'Phát sinh va quẹt nhẹ ở cản sau'),
  ('HD004', 'KH004', 'XE006', '2026-01-10', '2026-01-15', '18 Trần Duy Hưng, Cầu Giấy, Hà Nội', 1500000, 5520000, 'Đã hoàn thành', 'Trả trễ và có xước nhẹ cửa phải'),
  ('HD005', 'KH005', 'XE008', '2026-01-14', '2026-01-17', '92 Lạc Long Quân, Tây Hồ, Hà Nội', 2000000, 5400000, 'Đã hoàn thành', 'Thu bổ sung phụ kiện bị thiếu khi nhận lại xe'),
  ('HD006', 'KH006', 'XE010', '2026-01-17', '2026-01-19', '101 Nguyễn Văn Cừ, Long Biên, Hà Nội', 2500000, 4800000, 'Đã hoàn thành', 'Khách giữ xe quá giờ và cần cân chỉnh lốp'),
  ('HD007', 'KH007', 'XE012', '2026-01-20', '2026-01-24', '25 Quang Trung, Hà Đông, Hà Nội', 2500000, 8250000, 'Đã hoàn thành', 'Phục hồi bậc cửa sau chuyến đi tỉnh'),
  ('HD008', 'KH008', 'XE014', '2026-01-24', '2026-01-27', '66 Khuất Duy Tiến, Thanh Xuân, Hà Nội', 1800000, 4600000, 'Đã hoàn thành', 'Có phí phục hồi lazang và trả trễ 1 ngày'),
  ('HD009', 'KH009', 'XE015', '2026-01-27', '2026-02-01', '200 Minh Khai, Hai Bà Trưng, Hà Nội', 2500000, 8100000, 'Đã hoàn thành', 'Thu phí vệ sinh sâu khoang hành lý'),
  ('HD010', 'KH010', 'XE016', '2026-02-01', '2026-02-04', '11 Tôn Đức Thắng, Đống Đa, Hà Nội', 2500000, 6800000, 'Đã hoàn thành', 'Trả trễ và phát sinh móp nhẹ cản trước'),
  ('HD011', 'KH011', 'XE018', '2026-02-04', '2026-02-06', '30 Võ Chí Công, Tây Hồ, Hà Nội', 3000000, 8400000, 'Đã hoàn thành', 'Sửa nhẹ phần tay nắm cửa sau khi trả xe'),
  ('HD021', 'KH003', 'XE003', '2026-04-18', '2026-04-23', '8 Liễu Giai, Ba Đình, Hà Nội', 2000000, 5700000, 'Đang hiệu lực', 'Đơn thuê đang chạy cho khách doanh nghiệp'),
  ('HD022', 'KH006', 'XE007', '2026-04-19', '2026-04-24', '99 Trường Chinh, Đống Đa, Hà Nội', 2500000, 6600000, 'Đang hiệu lực', 'Khách thuê đi công tác miền Trung'),
  ('HD023', 'KH009', 'XE011', '2026-04-20', '2026-04-25', '21 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', 3000000, 10200000, 'Đang hiệu lực', 'Hợp đồng thuê tuần cuối tháng');

-- 7. BẢNG TRẢ XE (TRAXE)
INSERT INTO TraXe (MaTraXe, MaHD, NgayTraXe, TinhTrangXe, SoNgayThueThucTe, TongTienThue, TienCoc, SoTienConLai, TongTienThanhToan, HinhThucThanhToan, GhiChu) VALUES
  ('TRX001', 'HD001', '2026-01-06', 'Ngoại thất sạch, nội thất bẩn nhẹ', 3, 4200000, 1500000, 2700000, 3000000, 'Chuyển khoản', 'Đã thu thêm 300.000đ tiền vệ sinh da cao cấp'),
  ('TRX002', 'HD002', '2026-01-10', 'Xe bình thường, sạch sẽ', 5, 4500000, 1200000, 3300000, 3750000, 'Chuyển khoản', 'Đã thu thêm 450.000đ tiền phạt trả trễ 1 ngày'),
  ('TRX003', 'HD003', '2026-01-10', 'Xước cản sau bên lái khoảng 10cm', 2, 2100000, 1000000, 1100000, 1600000, 'Tiền mặt', 'Đã bồi hoàn 500.000đ tiền sơn phục hồi cản sau'),
  ('TRX004', 'HD004', '2026-01-16', 'Xước cửa phải, trả muộn 1 ngày', 6, 5520000, 1500000, 4020000, 4820000, 'Chuyển khoản', 'Phí trả muộn 460.000đ và sơn xử lý trầy 340.000đ'),
  ('TRX005', 'HD005', '2026-01-17', 'Mất thảm lót cốp sau', 3, 4050000, 2000000, 2050000, 2350000, 'ZaloPay', 'Đã thu bồi hoàn phụ kiện 300.000đ');

-- 8. BẢNG PHÍ PHẠT (PHIPHAT)
INSERT INTO PhiPhat (MaPP, MaTraXe, LoaiPhiPhat, SoTienPhat, GhiChu) VALUES
  ('PP001', 'TRX001', 'Phạt hỏng hóc', 300000, 'Vệ sinh chuyên sâu khoang nội thất da cao cấp'),
  ('PP002', 'TRX002', 'Phạt trả muộn', 450000, 'Trả trễ 1 ngày so với hợp đồng ban đầu'),
  ('PP003', 'TRX003', 'Phạt hỏng hóc', 500000, 'Sơn dặm phục hồi vết trầy cản sau'),
  ('PP004', 'TRX004', 'Cả trả muộn và hỏng hóc', 800000, 'Phạt trễ 1 ngày và đánh bóng xử lý vết xước cửa phụ'),
  ('PP005', 'TRX005', 'Phạt hỏng hóc', 300000, 'Bồi hoàn bộ thảm lót khoang hành lý');

-- 9. BẢNG BẢO TRÌ (BAOTRI)
INSERT INTO BaoTri (MaBaoTri, MaXe, NgayBaoTri, NoiDung, ChiPhi, TrangThai) VALUES
  ('BT001', 'XE005', '2026-04-10 09:00:00', 'Thay má phanh trước sau, láng đĩa phanh', 1850000, 'Đang bảo trì'),
  ('BT002', 'XE009', '2026-04-12 10:30:00', 'Vệ sinh giàn lạnh và nạp ga điều hòa sau', 2200000, 'Đang bảo trì'),
  ('BT003', 'XE013', '2026-04-14 14:00:00', 'Thay 2 quả lốp Michelin Primacy 4 trước', 4800000, 'Đang bảo trì'),
  ('BT004', 'XE017', '2026-04-15 08:30:00', 'Kiểm tra phần mềm quản lý pin và cân chỉnh lái', 950000, 'Đang bảo trì'),
  ('BT005', 'XE001', '2026-01-08 15:00:00', 'Bảo dưỡng cấp 4 vạn km tiêu chuẩn hãng', 3200000, 'Hoàn thành'),
  ('BT006', 'XE002', '2026-01-12 11:00:00', 'Thay dầu động cơ, lọc dầu, lọc gió', 850000, 'Hoàn thành'),
  ('BT007', 'XE004', '2026-01-15 09:30:00', 'Sơn dặm phục hồi cản sau', 600000, 'Hoàn thành');

-- 10. BẢNG HỘP THƯ LIÊN HỆ (LIENHE)
INSERT INTO LienHe (HoTen, SDT, Email, NoiDung, TrangThai) VALUES
  ('Trịnh Công Sơn', '0912888999', 'son.trinh@gmail.com', 'Tôi muốn thuê xe Camry theo tháng cho công ty, có xuất hóa đơn VAT không?', 'Mới'),
  ('Hoàng Thùy Linh', '0987654321', 'linh.hoang@yahoo.com', 'Cho hỏi xe Innova 7 chỗ nhận tại sân bay Nội Bài có phụ phí đón sớm 5h sáng không?', 'Mới'),
  ('Phan Đình Tùng', '0903112233', 'tung.phan@gmail.com', 'Dịch vụ giao nhận xe rất đúng giờ, xe sạch sẽ!', 'Đã phản hồi');

-- 11. BẢNG CÀI ĐẶT HỆ THỐNG (CAIDATTHETHONG)
INSERT INTO CaiDatHeThong (MaCaiDat, TenCongTy, SoDienThoai, EmailLienHe, DiaChi, ThongBaoEmail, CanhBaoDangKiem, CanhBaoHopDong, SoNgayCanhBaoDangKiem) VALUES
  (1, 'Hệ Thống Cho Thuê Xe Tự Lái & Có Tài Hà Nội', '1900 6868 - 0912 345 678', 'support@thuexetudong.vn', 'Số 10 Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội', TRUE, TRUE, TRUE, 30);

COMMIT;
