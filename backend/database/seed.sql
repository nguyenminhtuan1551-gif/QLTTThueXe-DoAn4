USE web_thue_xe;
SET NAMES utf8mb4;

-- Tài khoản quản trị demo: admin@carhire.vn / admin123
-- Tài khoản khách hàng demo: khach01@khachhang.vn / 123456

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
ALTER TABLE LienHe AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

START TRANSACTION;

INSERT INTO NhanVien (MaNV, HoTen, SDT, Email, ChucVu, MatKhau, TrangThai) VALUES
  ('NV001', 'Nguyễn Thanh Tùng', '0901112201', 'admin@carhire.vn', 'Admin', 'admin123', 'Đang hoạt động'),
  ('NV002', 'Trần Thị Mai', '0901112202', 'mai.tran@carhire.vn', 'Admin', 'admin123', 'Đang hoạt động'),
  ('NV003', 'Lê Hoàng Phúc', '0901112203', 'phuc.le@carhire.vn', 'Admin', 'admin123', 'Đang hoạt động'),
  ('NV004', 'Phạm Quốc Đạt', '0901112204', 'dat.pham@carhire.vn', 'Nhân viên', '123456', 'Đang hoạt động'),
  ('NV005', 'Võ Minh Khang', '0901112205', 'khang.vo@carhire.vn', 'Nhân viên', '123456', 'Đang hoạt động'),
  ('NV006', 'Đỗ Thị Lan', '0901112206', 'lan.do@carhire.vn', 'Nhân viên', '123456', 'Đang hoạt động'),
  ('NV007', 'Bùi Anh Thu', '0901112207', 'thu.bui@carhire.vn', 'Nhân viên', '123456', 'Đang hoạt động'),
  ('NV008', 'Đặng Gia Bảo', '0901112208', 'bao.dang@carhire.vn', 'Nhân viên', '123456', 'Đang hoạt động'),
  ('NV009', 'Hoàng Minh Đức', '0901112209', 'duc.hoang@carhire.vn', 'Nhân viên', '123456', 'Tạm khóa'),
  ('NV010', 'Nguyễn Gia Hân', '0901112210', 'han.nguyen@carhire.vn', 'Nhân viên', '123456', 'Tạm khóa');

INSERT INTO Xe (MaXe, BienSo, TenXe, LoaiXe, HangXe, NamSanXuat, GiaThue, NhienLieu, SoCho, TrangThai, HinhAnh, GhiChu) VALUES
  ('XE001', '30K-120.01', 'Toyota Camry 2.0Q 2023', 'Sedan', 'Toyota', 2023, 1400000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-01.jpg', 'Sedan phục vụ khách doanh nghiệp'),
  ('XE002', '30K-120.02', 'Hyundai Accent 1.5 AT 2024', 'Sedan', 'Hyundai', 2024, 900000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-02.jpg', 'Tiết kiệm nhiên liệu'),
  ('XE003', '30K-120.03', 'Kia K3 Premium 2023', 'Sedan', 'Kia', 2023, 950000, 'Xăng', 5, 'Đang thuê', '/uploads/car/xe-03.jpg', 'Đang chạy hợp đồng nội đô'),
  ('XE004', '30K-120.04', 'Mazda 3 Luxury 2024', 'Sedan', 'Mazda', 2024, 1050000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-04.jpg', 'Nội thất da màu kem'),
  ('XE005', '30K-120.05', 'Toyota Vios G 2022', 'Sedan', 'Toyota', 2022, 800000, 'Xăng', 5, 'Bảo trì', '/uploads/car/xe-05.jpg', 'Đang bảo trì hệ thống phanh'),
  ('XE006', '30K-120.06', 'Honda City RS 2024', 'Sedan', 'Honda', 2024, 920000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-06.jpg', 'Mới chạy 6.000 km'),
  ('XE007', '30K-120.07', 'Mitsubishi Xpander 2024', 'MPV', 'Mitsubishi', 2024, 1100000, 'Xăng', 7, 'Đang thuê', '/uploads/car/xe-07.jpg', 'Phù hợp gia đình 7 chỗ'),
  ('XE008', '30K-120.08', 'Toyota Innova Cross 2024', 'MPV', 'Toyota', 2024, 1350000, 'Hybrid', 7, 'Sẵn sàng', '/uploads/car/xe-08.jpg', 'Bản hybrid tiết kiệm'),
  ('XE009', '30K-120.09', 'Kia Carnival Signature 2023', 'MPV', 'Kia', 2023, 1800000, 'Dầu', 7, 'Bảo trì', '/uploads/car/xe-09.jpg', 'Đang xử lý điều hòa sau'),
  ('XE010', '30K-120.10', 'Hyundai Custin 2.0T 2024', 'MPV', 'Hyundai', 2024, 1600000, 'Xăng', 7, 'Sẵn sàng', '/uploads/car/xe-10.jpg', 'Ghế captain seat'),
  ('XE011', '30K-120.11', 'Ford Everest Titanium 2023', 'SUV', 'Ford', 2023, 1700000, 'Dầu', 7, 'Đang thuê', '/uploads/car/xe-11.jpg', 'Có camera 360'),
  ('XE012', '30K-120.12', 'Toyota Fortuner Legender 2024', 'SUV', 'Toyota', 2024, 1650000, 'Dầu', 7, 'Sẵn sàng', '/uploads/car/xe-12.jpg', 'Máy dầu 2.8'),
  ('XE013', '30K-120.13', 'Hyundai Tucson 2024', 'SUV', 'Hyundai', 2024, 1450000, 'Xăng', 5, 'Bảo trì', '/uploads/car/xe-13.jpg', 'Đang thay bộ lốp mới'),
  ('XE014', '30K-120.14', 'Kia Seltos 1.5 Turbo 2024', 'SUV', 'Kia', 2024, 1150000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-14.jpg', 'Bản cao cấp'),
  ('XE015', '30K-120.15', 'Mazda CX-5 Premium 2023', 'SUV', 'Mazda', 2023, 1350000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-15.jpg', 'Camera 360 đầy đủ'),
  ('XE016', '30K-120.16', 'Honda CR-V e:HEV RS 2024', 'SUV', 'Honda', 2024, 1700000, 'Hybrid', 7, 'Sẵn sàng', '/uploads/car/xe-16.jpg', 'Bản hybrid tiết kiệm'),
  ('XE017', '30K-120.17', 'VinFast VF 8 Plus 2024', 'SUV', 'VinFast', 2024, 1900000, 'Điện', 5, 'Bảo trì', '/uploads/car/xe-17.jpg', 'Đang chờ cập nhật phần mềm pin'),
  ('XE018', '30K-120.18', 'Mercedes-Benz C300 AMG 2023', 'Luxury', 'Mercedes-Benz', 2023, 2800000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-18.jpg', 'Xe cao cấp cho sự kiện'),
  ('XE019', '30K-120.19', 'BMW 520i M Sport 2022', 'Luxury', 'BMW', 2022, 3000000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-19.jpg', 'Ngoại thất đen sapphire'),
  ('XE020', '30K-120.20', 'Audi A6 45 TFSI 2023', 'Luxury', 'Audi', 2023, 3200000, 'Xăng', 5, 'Sẵn sàng', '/uploads/car/xe-20.jpg', 'Nội thất nâu gỗ óc chó');

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

INSERT INTO KhachHang (MaKH, HoTen, CCCD, SDT, Email, MatKhau, DiaChi, BangLai) VALUES
  ('KH001', 'Nguyễn Văn An', '790000000001', '0909000001', 'khach01@khachhang.vn', '123456', '12 Phan Chu Trinh, Hoàn Kiếm, Hà Nội', 'B2-200001'),
  ('KH002', 'Trần Thị Bình', '790000000002', '0909000002', 'khach02@khachhang.vn', '123456', '87 Nguyễn Chí Thanh, Đống Đa, Hà Nội', 'B2-200002'),
  ('KH003', 'Lê Minh Châu', '790000000003', '0909000003', 'khach03@khachhang.vn', '123456', '45 Lò Đúc, Hai Bà Trưng, Hà Nội', 'B2-200003'),
  ('KH004', 'Phạm Hoàng Dũng', '790000000004', '0909000004', 'khach04@khachhang.vn', '123456', '18 Trần Duy Hưng, Cầu Giấy, Hà Nội', 'B2-200004'),
  ('KH005', 'Võ Gia Hân', '790000000005', '0909000005', 'khach05@khachhang.vn', '123456', '92 Lạc Long Quân, Tây Hồ, Hà Nội', 'B2-200005'),
  ('KH006', 'Đặng Quốc Huy', '790000000006', '0909000006', 'khach06@khachhang.vn', '123456', '101 Nguyễn Văn Cừ, Long Biên, Hà Nội', 'B2-200006'),
  ('KH007', 'Bùi Thanh Lâm', '790000000007', '0909000007', 'khach07@khachhang.vn', '123456', '25 Quang Trung, Hà Đông, Hà Nội', 'B2-200007'),
  ('KH008', 'Nguyễn Thị My', '790000000008', '0909000008', 'khach08@khachhang.vn', '123456', '66 Khuất Duy Tiến, Thanh Xuân, Hà Nội', 'B2-200008'),
  ('KH009', 'Trần Đức Nam', '790000000009', '0909000009', 'khach09@khachhang.vn', '123456', '200 Minh Khai, Hai Bà Trưng, Hà Nội', 'B2-200009'),
  ('KH010', 'Lê Ngọc Oanh', '790000000010', '0909000010', 'khach10@khachhang.vn', '123456', '11 Tôn Đức Thắng, Đống Đa, Hà Nội', 'B2-200010'),
  ('KH011', 'Phan Quang Phúc', '790000000011', '0909000011', 'khach11@khachhang.vn', '123456', '30 Võ Chí Công, Tây Hồ, Hà Nội', 'B2-200011'),
  ('KH012', 'Hoàng Thanh Quân', '790000000012', '0909000012', 'khach12@khachhang.vn', '123456', '15 Nguyễn Xiển, Thanh Xuân, Hà Nội', 'B2-200012'),
  ('KH013', 'Đỗ Thu Trang', '790000000013', '0909000013', 'khach13@khachhang.vn', '123456', '88 Trần Thái Tông, Cầu Giấy, Hà Nội', 'B2-200013'),
  ('KH014', 'Ngô Minh Tuấn', '790000000014', '0909000014', 'khach14@khachhang.vn', '123456', '40 Phạm Hùng, Nam Từ Liêm, Hà Nội', 'B2-200014'),
  ('KH015', 'Vũ Nhật Uyên', '790000000015', '0909000015', 'khach15@khachhang.vn', '123456', '126 Ngọc Lâm, Long Biên, Hà Nội', 'B2-200015'),
  ('KH016', 'Dương Gia Vy', '790000000016', '0909000016', 'khach16@khachhang.vn', '123456', '72 Nguyễn Trãi, Thanh Xuân, Hà Nội', 'B2-200016'),
  ('KH017', 'Mai Bảo Yến', '790000000017', '0909000017', 'khach17@khachhang.vn', '123456', '9 Trần Phú, Hà Đông, Hà Nội', 'B2-200017'),
  ('KH018', 'Tôn Thất Dũng', '790000000018', '0909000018', 'khach18@khachhang.vn', '123456', '60 Giải Phóng, Hoàng Mai, Hà Nội', 'B2-200018'),
  ('KH019', 'Lâm Hải Sơn', '790000000019', '0909000019', 'khach19@khachhang.vn', '123456', '17 Hồ Tùng Mậu, Nam Từ Liêm, Hà Nội', 'B2-200019'),
  ('KH020', 'Kiều Anh Thu', '790000000020', '0909000020', 'khach20@khachhang.vn', '123456', '5 Nguyễn Văn Huyên, Cầu Giấy, Hà Nội', 'B2-200020');

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
  ('HD012', 'KH012', 'XE019', '2026-02-07', '2026-02-09', '15 Nguyễn Xiển, Thanh Xuân, Hà Nội', 5000000, 9000000, 'Đã hoàn thành', 'Xe cao cấp trả trễ 1 ngày'),
  ('HD013', 'KH013', 'XE020', '2026-02-10', '2026-02-13', '88 Trần Thái Tông, Cầu Giấy, Hà Nội', 5500000, 12800000, 'Đã hoàn thành', 'Có phát sinh sửa gương chiếu hậu'),
  ('HD014', 'KH014', 'XE001', '2026-02-13', '2026-02-15', '40 Phạm Hùng, Nam Từ Liêm, Hà Nội', 1800000, 4200000, 'Đã hoàn thành', 'Thu phí khử mùi và vệ sinh da nội thất'),
  ('HD015', 'KH015', 'XE002', '2026-02-16', '2026-02-20', '126 Ngọc Lâm, Long Biên, Hà Nội', 1200000, 4500000, 'Đã hoàn thành', 'Trả trễ 1 ngày do ùn tắc cao tốc'),
  ('HD016', 'KH016', 'XE004', '2026-02-20', '2026-02-23', '72 Nguyễn Trãi, Thanh Xuân, Hà Nội', 1000000, 4200000, 'Đã hoàn thành', 'Phí vệ sinh nội thất chi tiết'),
  ('HD017', 'KH017', 'XE006', '2026-02-23', '2026-02-25', '9 Trần Phú, Hà Đông, Hà Nội', 1500000, 2760000, 'Đã hoàn thành', 'Thay chụp mâm mới cho xe'),
  ('HD018', 'KH018', 'XE008', '2026-03-01', '2026-03-06', '60 Giải Phóng, Hoàng Mai, Hà Nội', 2000000, 8100000, 'Đã hoàn thành', 'Có phí phục hồi mâm và trả trễ 1 ngày'),
  ('HD019', 'KH019', 'XE010', '2026-03-05', '2026-03-09', '17 Hồ Tùng Mậu, Nam Từ Liêm, Hà Nội', 2500000, 8000000, 'Đã hoàn thành', 'Thu bồi hoàn phụ kiện cứu hộ khẩn cấp'),
  ('HD020', 'KH020', 'XE012', '2026-03-09', '2026-03-12', '5 Nguyễn Văn Huyên, Cầu Giấy, Hà Nội', 2500000, 6600000, 'Đã hoàn thành', 'Trả trễ và phát sinh sửa kính hậu'),
  ('HD021', 'KH003', 'XE003', '2026-04-18', '2026-04-23', '8 Liễu Giai, Ba Đình, Hà Nội', 2000000, 5700000, 'Đang hiệu lực', 'Đơn thuê đang chạy cho khách doanh nghiệp'),
  ('HD022', 'KH006', 'XE007', '2026-04-19', '2026-04-24', '99 Trường Chinh, Đống Đa, Hà Nội', 2500000, 6600000, 'Đang hiệu lực', 'Khách thuê đi công tác miền Trung'),
  ('HD023', 'KH009', 'XE011', '2026-04-20', '2026-04-25', '21 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội', 3000000, 10200000, 'Đang hiệu lực', 'Hợp đồng thuê tuần cuối tháng'),
  ('HD024', 'KH012', 'XE014', '2026-04-28', '2026-05-02', '55 Trần Phú, Hoàn Kiếm, Hà Nội', 1500000, 5750000, 'Chờ xác nhận', 'Chờ admin xác nhận lịch giao xe'),
  ('HD025', 'KH015', 'XE010', '2026-04-12', '2026-04-14', '44 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', 2000000, 4800000, 'Đã hủy', 'Khách đổi kế hoạch trước ngày nhận xe');

INSERT INTO AnhDatXe (MaAnh, MaHD, DuongDan, TenTep) VALUES
  ('IMG001', 'HD021', '/uploads/car/xe-03.jpg', 'diem-don-van-phong-1.jpg'),
  ('IMG002', 'HD021', '/uploads/car/xe-04.jpg', 'diem-don-van-phong-2.jpg'),
  ('IMG003', 'HD022', '/uploads/car/xe-07.jpg', 'diem-don-cong-tac.jpg'),
  ('IMG004', 'HD023', '/uploads/car/xe-11.jpg', 'diem-don-chung-cu.jpg'),
  ('IMG005', 'HD024', '/uploads/car/xe-14.jpg', 'diem-don-cho-xac-nhan-1.jpg'),
  ('IMG006', 'HD024', '/uploads/car/xe-15.jpg', 'diem-don-cho-xac-nhan-2.jpg');

INSERT INTO TraXe (MaTraXe, MaHD, NgayTraXe, TinhTrangXe, SoNgayThueThucTe, TongTienThue, TienCoc, SoTienConLai, TongTienThanhToan, HinhThucThanhToan, GhiChu) VALUES
  ('TRX001', 'HD001', '2026-01-06', 'Nội thất bẩn nhẹ', 4, 5600000, 1500000, 4100000, 4250000, 'Tiền mặt', 'Thu phí vệ sinh nội thất sau chuyến đi'),
  ('TRX002', 'HD002', '2026-01-10', 'Tốt', 6, 5400000, 1200000, 4200000, 4400000, 'Chuyển khoản', 'Khách trả trễ 1 ngày do kẹt lịch'),
  ('TRX003', 'HD003', '2026-01-10', 'Xước nhẹ cản sau', 3, 3150000, 1000000, 2150000, 2650000, 'Momo', 'Phát sinh va quẹt nhẹ ở cản sau'),
  ('TRX004', 'HD004', '2026-01-16', 'Xước nhẹ cửa phải', 7, 6440000, 1500000, 4940000, 5840000, 'ZaloPay', 'Trả trễ và có xước nhẹ cửa phải'),
  ('TRX005', 'HD005', '2026-01-17', 'Thiếu thảm lót sàn', 4, 5400000, 2000000, 3400000, 3650000, 'Tiền mặt', 'Thu bổ sung phụ kiện bị thiếu khi nhận lại xe'),
  ('TRX006', 'HD006', '2026-01-20', 'Lốp mòn nhẹ', 4, 6400000, 2500000, 3900000, 4300000, 'Chuyển khoản', 'Khách giữ xe quá giờ và cần cân chỉnh lốp'),
  ('TRX007', 'HD007', '2026-01-24', 'Trầy bậc cửa', 5, 8250000, 2500000, 5750000, 6100000, 'Momo', 'Phục hồi bậc cửa sau chuyến đi tỉnh'),
  ('TRX008', 'HD008', '2026-01-28', 'Trầy lazang', 5, 5750000, 1800000, 3950000, 4600000, 'Tiền mặt', 'Có phí phục hồi lazang và trả trễ 1 ngày'),
  ('TRX009', 'HD009', '2026-02-01', 'Cần vệ sinh khoang hành lý', 6, 8100000, 2500000, 5600000, 5780000, 'Chuyển khoản', 'Thu phí vệ sinh sâu khoang hành lý'),
  ('TRX010', 'HD010', '2026-02-05', 'Móp nhẹ cản trước', 5, 8500000, 2500000, 6000000, 7200000, 'Momo', 'Trả trễ và phát sinh móp nhẹ cản trước'),
  ('TRX011', 'HD011', '2026-02-06', 'Xước nhẹ tay nắm cửa', 3, 8400000, 3000000, 5400000, 5700000, 'ZaloPay', 'Sửa nhẹ phần tay nắm cửa sau khi trả xe'),
  ('TRX012', 'HD012', '2026-02-10', 'Tốt', 4, 12000000, 5000000, 7000000, 7300000, 'Tiền mặt', 'Xe cao cấp trả trễ 1 ngày'),
  ('TRX013', 'HD013', '2026-02-13', 'Trầy gương chiếu hậu', 4, 12800000, 5500000, 7300000, 8000000, 'Chuyển khoản', 'Có phát sinh sửa gương chiếu hậu'),
  ('TRX014', 'HD014', '2026-02-15', 'Nội thất ám mùi thuốc', 3, 4200000, 1800000, 2400000, 2620000, 'Momo', 'Thu phí khử mùi và vệ sinh da nội thất'),
  ('TRX015', 'HD015', '2026-02-21', 'Tốt', 6, 5400000, 1200000, 4200000, 4450000, 'ZaloPay', 'Trả trễ 1 ngày do ùn tắc cao tốc'),
  ('TRX016', 'HD016', '2026-02-23', 'Nội thất bẩn nhẹ', 4, 4200000, 1000000, 3200000, 3550000, 'Tiền mặt', 'Phí vệ sinh nội thất chi tiết'),
  ('TRX017', 'HD017', '2026-02-25', 'Mẻ nhẹ chụp mâm', 3, 2760000, 1500000, 1260000, 1540000, 'Chuyển khoản', 'Thay chụp mâm mới cho xe'),
  ('TRX018', 'HD018', '2026-03-07', 'Xước mâm trước', 7, 9450000, 2000000, 7450000, 8000000, 'Momo', 'Có phí phục hồi mâm và trả trễ 1 ngày'),
  ('TRX019', 'HD019', '2026-03-09', 'Thiếu bình xịt lốp dự phòng', 5, 8000000, 2500000, 5500000, 5760000, 'ZaloPay', 'Thu bồi hoàn phụ kiện cứu hộ khẩn cấp'),
  ('TRX020', 'HD020', '2026-03-13', 'Kính hậu trầy nhẹ', 5, 8250000, 2500000, 5750000, 6600000, 'Tiền mặt', 'Trả trễ và phát sinh sửa kính hậu');

INSERT INTO PhiPhat (MaPP, MaTraXe, LoaiPhiPhat, SoTienPhat, GhiChu) VALUES
  ('PP001', 'TRX001', 'Phạt hỏng hóc', 150000, 'Thu phí vệ sinh nội thất sau chuyến đi'),
  ('PP002', 'TRX002', 'Phạt trả muộn', 200000, 'Khách trả trễ 1 ngày do kẹt lịch'),
  ('PP003', 'TRX003', 'Phạt hỏng hóc', 500000, 'Phát sinh va quẹt nhẹ ở cản sau'),
  ('PP004', 'TRX004', 'Cả trả muộn và hỏng hóc', 900000, 'Trả trễ và có xước nhẹ cửa phải'),
  ('PP005', 'TRX005', 'Phạt hỏng hóc', 250000, 'Thu bổ sung phụ kiện bị thiếu khi nhận lại xe'),
  ('PP006', 'TRX006', 'Cả trả muộn và hỏng hóc', 400000, 'Khách giữ xe quá giờ và cần cân chỉnh lốp'),
  ('PP007', 'TRX007', 'Phạt hỏng hóc', 350000, 'Phục hồi bậc cửa sau chuyến đi tỉnh'),
  ('PP008', 'TRX008', 'Cả trả muộn và hỏng hóc', 650000, 'Có phí phục hồi lazang và trả trễ 1 ngày'),
  ('PP009', 'TRX009', 'Phạt hỏng hóc', 180000, 'Thu phí vệ sinh sâu khoang hành lý'),
  ('PP010', 'TRX010', 'Cả trả muộn và hỏng hóc', 1200000, 'Trả trễ và phát sinh móp nhẹ cản trước'),
  ('PP011', 'TRX011', 'Phạt hỏng hóc', 300000, 'Sửa nhẹ phần tay nắm cửa sau khi trả xe'),
  ('PP012', 'TRX012', 'Phạt trả muộn', 300000, 'Xe cao cấp trả trễ 1 ngày'),
  ('PP013', 'TRX013', 'Phạt hỏng hóc', 700000, 'Có phát sinh sửa gương chiếu hậu'),
  ('PP014', 'TRX014', 'Phạt hỏng hóc', 220000, 'Thu phí khử mùi và vệ sinh da nội thất'),
  ('PP015', 'TRX015', 'Phạt trả muộn', 250000, 'Trả trễ 1 ngày do ùn tắc cao tốc'),
  ('PP016', 'TRX016', 'Phạt hỏng hóc', 350000, 'Phí vệ sinh nội thất chi tiết'),
  ('PP017', 'TRX017', 'Phạt hỏng hóc', 280000, 'Thay chụp mâm mới cho xe'),
  ('PP018', 'TRX018', 'Cả trả muộn và hỏng hóc', 550000, 'Có phí phục hồi mâm và trả trễ 1 ngày'),
  ('PP019', 'TRX019', 'Phạt hỏng hóc', 260000, 'Thu bồi hoàn phụ kiện cứu hộ khẩn cấp'),
  ('PP020', 'TRX020', 'Cả trả muộn và hỏng hóc', 850000, 'Trả trễ và phát sinh sửa kính hậu');

INSERT INTO BaoTri (MaBaoTri, MaXe, NgayBaoTri, NoiDung, ChiPhi, TrangThai) VALUES
  ('BT001', 'XE005', '2026-04-15 08:30:00', 'Bảo trì hệ thống phanh và thay má phanh trước', 4200000, 'Đang bảo trì'),
  ('BT002', 'XE009', '2026-04-16 09:00:00', 'Kiểm tra dàn lạnh sau và thay quạt gió phụ', 5600000, 'Đang bảo trì'),
  ('BT003', 'XE013', '2026-04-17 13:30:00', 'Thay mới 4 lốp và cân chỉnh thước lái', 9800000, 'Đang bảo trì'),
  ('BT004', 'XE017', '2026-04-18 10:00:00', 'Cập nhật phần mềm pin và kiểm tra BMS', 2500000, 'Đang bảo trì'),
  ('BT005', 'XE001', '2026-01-02 09:15:00', 'Thay dầu máy định kỳ và lọc dầu', 1800000, 'Hoàn thành'),
  ('BT006', 'XE002', '2026-01-09 14:00:00', 'Vệ sinh kim phun và cân chỉnh phanh', 1250000, 'Hoàn thành'),
  ('BT007', 'XE003', '2026-01-16 10:00:00', 'Cân bằng động và đảo lốp', 950000, 'Hoàn thành'),
  ('BT008', 'XE004', '2026-01-22 15:30:00', 'Phủ ceramic và xử lý xước nhẹ', 2400000, 'Hoàn thành'),
  ('BT009', 'XE006', '2026-01-28 08:45:00', 'Thay ắc quy mới', 2650000, 'Hoàn thành'),
  ('BT010', 'XE007', '2026-02-03 09:30:00', 'Bảo dưỡng cấp 10.000 km', 1350000, 'Hoàn thành'),
  ('BT011', 'XE008', '2026-02-07 10:30:00', 'Kiểm tra hệ thống hybrid và cập nhật ECU', 1950000, 'Hoàn thành'),
  ('BT012', 'XE010', '2026-02-11 13:00:00', 'Vệ sinh dàn lạnh và thay lọc gió', 1480000, 'Hoàn thành'),
  ('BT013', 'XE011', '2026-02-15 16:00:00', 'Cân chỉnh cảm biến camera 360', 1750000, 'Hoàn thành'),
  ('BT014', 'XE012', '2026-02-18 09:10:00', 'Thay dầu hộp số định kỳ', 3250000, 'Hoàn thành'),
  ('BT015', 'XE014', '2026-02-21 15:45:00', 'Sơn dặm cản trước', 2100000, 'Hoàn thành'),
  ('BT016', 'XE015', '2026-02-26 08:20:00', 'Kiểm tra gầm và chụm bánh trước', 1320000, 'Hoàn thành'),
  ('BT017', 'XE016', '2026-03-03 11:15:00', 'Bảo dưỡng hệ thống hybrid', 2860000, 'Hoàn thành'),
  ('BT018', 'XE018', '2026-03-09 09:05:00', 'Làm mới nội thất da và đánh bóng sơn', 3650000, 'Hoàn thành'),
  ('BT019', 'XE019', '2026-03-12 13:15:00', 'Thay bố thắng sau', 2240000, 'Hoàn thành'),
  ('BT020', 'XE020', '2026-03-14 10:10:00', 'Cân chỉnh đèn pha và hệ thống ADAS', 3120000, 'Hoàn thành');

INSERT INTO LienHe (HoTen, SDT, Email, NoiDung, TrangThai) VALUES
  ('Khách liên hệ 01', '0988000001', 'lienhe01@mail.vn', 'Tôi muốn hỏi thủ tục thuê xe tự lái cuối tuần tại Hà Nội.', 'Mới'),
  ('Khách liên hệ 02', '0988000002', 'lienhe02@mail.vn', 'Nhờ tư vấn xe 7 chỗ cho gia đình đi Ba Vì.', 'Mới'),
  ('Khách liên hệ 03', '0988000003', 'lienhe03@mail.vn', 'Tôi cần xuất hóa đơn VAT cho hợp đồng doanh nghiệp.', 'Đã phản hồi'),
  ('Khách liên hệ 04', '0988000004', 'lienhe04@mail.vn', 'Muốn hỏi có giao xe tận nơi ở Cầu Giấy không.', 'Mới'),
  ('Khách liên hệ 05', '0988000005', 'lienhe05@mail.vn', 'Tôi cần thuê xe có tài xế cho khách đối tác.', 'Mới'),
  ('Khách liên hệ 06', '0988000006', 'lienhe06@mail.vn', 'Nhờ báo giá thuê xe 4 ngày dịp lễ 30/4.', 'Đã phản hồi'),
  ('Khách liên hệ 07', '0988000007', 'lienhe07@mail.vn', 'Tôi muốn biết chính sách hoàn cọc khi hủy sớm.', 'Mới'),
  ('Khách liên hệ 08', '0988000008', 'lienhe08@mail.vn', 'Cho tôi hỏi có hỗ trợ giao xe sân bay Nội Bài không.', 'Mới'),
  ('Khách liên hệ 09', '0988000009', 'lienhe09@mail.vn', 'Tôi muốn thuê xe điện VinFast để trải nghiệm.', 'Đã phản hồi'),
  ('Khách liên hệ 10', '0988000010', 'lienhe10@mail.vn', 'Nhờ tư vấn xe sang cho lễ cưới ở Long Biên.', 'Mới');

INSERT INTO CaiDatHeThong (MaCaiDat, TenCongTy, SoDienThoai, EmailLienHe, DiaChi, ThongBaoEmail, CanhBaoDangKiem, CanhBaoHopDong, SoNgayCanhBaoDangKiem) VALUES
  (1, 'CarHire Pro', '024 1234 5678', 'contact@carhire.vn', '88 Trần Duy Hưng, Cầu Giấy, Hà Nội', TRUE, TRUE, TRUE, 30);

COMMIT;
