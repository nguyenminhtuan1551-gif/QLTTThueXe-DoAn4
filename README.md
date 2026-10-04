# TÀI LIỆU MÔ TẢ QUY TRÌNH NGHIỆP VỤ HỆ THỐNG THUÊ XE

## 1. Tổng quan

Hệ thống hỗ trợ khách hàng tìm và đặt thuê xe, theo dõi đơn thuê và tra cứu thông tin. Nhân viên tiếp nhận đơn, điều phối xe, làm thủ tục trả xe, quyết toán và quản lý hoạt động của đội xe.

Các trạng thái đơn thuê gồm: **Chờ xác nhận**, **Đang hiệu lực**, **Đã hoàn thành** và **Đã hủy**. Xe có thể ở trạng thái **Sẵn sàng**, **Đang thuê** hoặc **Bảo trì**. Xe hết hạn đăng kiểm cũng không được đặt thuê.

## 2. Quy trình khách hàng đặt thuê xe

```text
Khách hàng mở ứng dụng
        ↓
Đăng ký hoặc đăng nhập
        ↓
Xem, tìm kiếm và lọc xe
        ↓
Chọn xe và xem chi tiết
        ↓
Kiểm tra lịch xe đã được đặt trước
        ↓
Chọn ngày nhận xe, ngày trả dự kiến và điểm nhận xe
        ↓
Kiểm tra thông tin hồ sơ, đính kèm ảnh giấy tờ nếu cần
        ↓
Xem tổng tiền thuê và tiền cọc
        ↓
Gửi yêu cầu thuê xe
        ↓
Đơn thuê được tạo ở trạng thái chờ xác nhận
```

### Bước 1: Đăng ký hoặc đăng nhập

Khách chưa có tài khoản có thể đăng ký bằng họ tên, số điện thoại, email, mật khẩu, giấy phép lái xe, địa chỉ và thông tin giấy tờ cá nhân. Sau khi đăng nhập, khách có thể bắt đầu tìm và đặt xe.

### Bước 2: Tìm xe phù hợp

Khách có thể xem xe nổi bật hoặc danh sách xe cho thuê. Khách tìm xe theo tên, hãng, biển số hoặc khu vực; đồng thời có thể lọc theo kiểu dáng, số chỗ, loại nhiên liệu, giá thuê và trạng thái xe.

### Bước 3: Xem chi tiết xe

Khách xem được hình ảnh, hãng xe, năm sản xuất, biển số, khu vực xe đang có, giá thuê theo ngày, số chỗ, nhiên liệu, kiểu dáng, mô tả và trang bị xe. Khách cũng xem được tình trạng đăng kiểm và các khoảng thời gian xe đã được đặt trước.

Xe đang thuê, đang bảo trì hoặc hết hạn đăng kiểm sẽ không thể được đặt thuê.

### Bước 4: Chọn lịch thuê và điểm nhận xe

Khách chọn ngày nhận xe, ngày trả dự kiến và nhập điểm nhận xe. Hệ thống kiểm tra để thời gian thuê không trùng với lịch đã có của xe. Khách có thể thêm ghi chú cho nhân viên điều phối, ví dụ thời gian giao nhận mong muốn hoặc yêu cầu riêng.

### Bước 5: Kiểm tra hồ sơ và giấy tờ

Khách kiểm tra họ tên, số điện thoại và email. Thông tin căn cước, giấy phép lái xe và địa chỉ được lấy từ hồ sơ để dùng cho đơn thuê. Khách có thể đính kèm tối đa sáu ảnh giấy tờ bằng cách chụp ảnh hoặc chọn ảnh có sẵn.

### Bước 6: Xem chi phí và gửi yêu cầu

Hệ thống tính số ngày thuê, giá thuê theo ngày và tổng tiền thuê dự kiến. Tiền cọc giữ xe là **30% tổng tiền thuê**; 70% còn lại được thanh toán khi bàn giao xe.

Khi khách xác nhận gửi yêu cầu, hệ thống tạo đơn thuê ở trạng thái **Chờ xác nhận**. Khách xem được mã đơn, thông tin chuyến đi, số tiền cọc và hướng dẫn chuyển khoản đặt cọc.

## 3. Quy trình nhân viên tiếp nhận và duyệt đơn

```text
Nhân viên nhận đơn thuê mới
        ↓
Xem thông tin khách hàng, xe, lịch thuê và giấy tờ
        ↓
Kiểm tra thông tin giao nhận
        ↓
Duyệt đơn hoặc hủy đơn
        ↓
Nếu duyệt: đơn đang hiệu lực
        ↓
Xe chuyển sang trạng thái đang thuê
        ↓
Điều phối giao xe theo thông tin đã đặt
```

### Bước 1: Kiểm tra đơn thuê

Nhân viên mở đơn thuê để xem thông tin khách hàng, xe được chọn, thời gian thuê, điểm nhận xe, ghi chú, tiền cọc, tổng tiền dự kiến và ảnh giấy tờ mà khách đã gửi.

### Bước 2: Duyệt hoặc hủy đơn

Nếu đủ điều kiện phục vụ, nhân viên duyệt đơn. Đơn chuyển sang **Đang hiệu lực** và xe chuyển sang **Đang thuê**. Nếu không tiếp tục thực hiện, nhân viên hủy đơn; đơn thành **Đã hủy** và xe được đưa về trạng thái sẵn sàng.

Khách có thể theo dõi trạng thái mới của đơn trong phần đơn thuê của mình. Sau khi gửi yêu cầu, khách cũng được thông báo nhân viên điều phối sẽ liên hệ xác nhận điểm giao nhận xe.

## 4. Nhận xe và thời gian đang thuê

```text
Đơn được duyệt
        ↓
Khách xem lại thông tin đơn và lịch nhận xe
        ↓
Khách xuất trình giấy tờ gốc
        ↓
Nhân viên bàn giao xe theo điểm đã đăng ký
        ↓
Xe được ghi nhận đang thuê
        ↓
Khách sử dụng xe và theo dõi đơn thuê
```

Sau khi đơn được duyệt, khách xem lại xe thuê, lịch thuê, điểm nhận xe, tiền cọc và phần tiền còn lại. Khi nhận xe, khách cần xuất trình giấy tờ gốc và giấy phép lái xe hợp lệ. Việc bàn giao được thực hiện theo điểm nhận xe đã đăng ký.

Trong thời gian thuê, khách có thể:

- Xem danh sách đơn của mình, lọc theo trạng thái và tìm theo mã đơn, tên xe, biển số hoặc điểm nhận xe.
- Xem chi tiết xe, lịch thuê, ghi chú, tiền cọc, tổng tiền, phần tiền còn lại và trạng thái đơn.
- Xem ảnh giấy tờ đã đính kèm.
- Tra cứu đơn bằng mã đơn, số điện thoại hoặc số căn cước.
- Cập nhật hồ sơ cá nhân và gửi yêu cầu hỗ trợ/góp ý.

## 5. Quy trình trả xe và quyết toán

```text
Khách kết thúc thời gian thuê và trả xe
        ↓
Nhân viên chọn đơn đang hiệu lực cần trả xe
        ↓
Ghi nhận ngày trả thực tế và tình trạng xe
        ↓
Chọn hình thức thanh toán
        ↓
Kiểm tra phí phạt phát sinh nếu có
        ↓
Tính tiền thuê thực tế - tiền cọc + phí phạt
        ↓
Hoàn tất trả xe và quyết toán
        ↓
Đơn chuyển sang đã hoàn thành
        ↓
Xe chuyển về trạng thái sẵn sàng
```

### Bước 1: Tiếp nhận xe trả

Nhân viên chọn đơn đang hiệu lực tương ứng, ghi nhận ngày trả thực tế và kiểm tra tình trạng xe khi nhận lại, ví dụ ngoại thất, nội thất hoặc nhiên liệu.

### Bước 2: Quyết toán

Nhân viên chọn hình thức thanh toán: chuyển khoản, tiền mặt, Momo hoặc ZaloPay. Hệ thống tính số ngày thuê thực tế và tổng tiền thuê thực tế, sau đó trừ tiền cọc đã nộp.

### Bước 3: Ghi nhận phí phát sinh

Nếu khách trả xe muộn, xe bị hỏng/trầy xước hoặc có cả hai trường hợp, nhân viên ghi nhận loại vi phạm, số tiền phạt và lý do. Khoản phạt được cộng vào số tiền quyết toán cuối cùng.

### Bước 4: Hoàn thành đơn

Sau khi hoàn tất trả xe, hệ thống lưu biên bản trả xe, đơn chuyển sang **Đã hoàn thành** và xe trở về **Sẵn sàng** để nhận lượt thuê tiếp theo. Khách có thể xem ngày trả thực tế, tình trạng xe, hình thức thanh toán, tổng tiền quyết toán và phí phạt nếu có trong chi tiết đơn.

## 6. Sơ đồ quy trình thuê xe hoàn chỉnh

```text
KHÁCH HÀNG
    ↓
Đăng ký hoặc đăng nhập
    ↓
Tìm xe và xem chi tiết
    ↓
Chọn lịch thuê, điểm nhận xe và gửi yêu cầu
    ↓
Đơn chờ xác nhận
    ↓
────────────────────────
NHÂN VIÊN
────────────────────────
    ↓
Kiểm tra đơn, hồ sơ, giấy tờ và lịch xe
    ↓
Duyệt đơn
    ↓
Đơn đang hiệu lực, xe đang thuê
    ↓
Điều phối giao xe
    ↓
────────────────────────
KHÁCH HÀNG
────────────────────────
    ↓
Nhận xe, sử dụng xe và theo dõi đơn
    ↓
Trả xe
    ↓
────────────────────────
NHÂN VIÊN
────────────────────────
    ↓
Kiểm tra xe, lập phiếu trả xe và quyết toán
    ↓
Hoàn thành đơn thuê
    ↓
Xe sẵn sàng cho lượt thuê tiếp theo
```

## 7. Các giao diện dành cho khách hàng

### Giao diện đăng nhập và đăng ký

Giao diện này dùng để khách tạo tài khoản, đăng nhập và cung cấp thông tin hồ sơ cần thiết cho việc thuê xe.

### Giao diện trang chủ

Giao diện này dùng để giới thiệu xe nổi bật, hãng xe phổ biến, danh sách xe cho thuê và thông tin dịch vụ. Khách có thể đi nhanh đến danh mục xe hoặc hồ sơ cá nhân.

### Giao diện danh mục xe

Giao diện này dùng để tìm và lọc xe theo tên, hãng, biển số, khu vực, kiểu dáng, số chỗ, nhiên liệu, giá thuê và trạng thái.

### Giao diện chi tiết xe

Giao diện này dùng để khách xem đầy đủ thông tin xe, lịch đã đặt, đăng kiểm, mô tả, trang bị, giá thuê và điều kiện nhận xe trước khi quyết định đặt.

### Giao diện đặt xe và đặt xe thành công

Giao diện này dùng để khách nhập lịch thuê, điểm nhận xe, ghi chú, kiểm tra hồ sơ, đính kèm ảnh giấy tờ và xem chi phí. Sau khi đặt thành công, khách xem mã đơn, tóm tắt chuyến đi, tiền cọc và hướng dẫn thanh toán cọc.

### Giao diện đơn thuê, chi tiết đơn và tra cứu

Giao diện này dùng để khách theo dõi đơn theo từng trạng thái, xem chi tiết thuê/trả xe và tra cứu đơn nhanh bằng mã đơn, số điện thoại hoặc số căn cước.

### Giao diện tài khoản và hỗ trợ

Giao diện này dùng để khách xem hoặc cập nhật hồ sơ, giấy tờ, địa chỉ; đồng thời gửi yêu cầu hỗ trợ hoặc góp ý cho nhân viên.

## 8. Các giao diện dành cho nhân viên và quản trị viên

### Giao diện tổng quan

Giao diện này dùng để theo dõi số lượng xe, xe sẵn sàng, xe đang thuê, đơn đang hiệu lực, khách hàng, doanh thu, cảnh báo đăng kiểm, đơn sắp đến hạn trả và hoạt động gần đây.

### Giao diện quản lý đội xe

Giao diện này dùng để xem, tìm kiếm, lọc, thêm, sửa và cập nhật hình ảnh xe; theo dõi giá thuê, khu vực và trạng thái xe.

### Giao diện quản lý hợp đồng thuê xe

Giao diện này dùng để tiếp nhận đơn, xem hồ sơ/giấy tờ, duyệt hoặc hủy đơn và tạo đơn cho khách đến trực tiếp.

### Giao diện trả xe, quyết toán và phí phạt

Giao diện này dùng để ghi nhận trả xe, tình trạng xe, thanh toán, tiền cọc và phí phát sinh. Giao diện phí phạt dùng để theo dõi loại vi phạm, số tiền, khách hàng, xe và lý do phạt.

### Giao diện đăng kiểm và bảo trì

Giao diện đăng kiểm dùng để theo dõi hạn kiểm định của xe. Giao diện bảo trì dùng để ghi nhận nội dung, chi phí, tiến độ sửa chữa và ngày hoàn thành; xe đang bảo trì sẽ không nhận thuê.

### Giao diện khách hàng, liên hệ, báo cáo, nhân sự và cài đặt

Các giao diện này lần lượt dùng để xem hồ sơ/lịch sử thuê của khách, tiếp nhận phản hồi hỗ trợ, tổng hợp doanh thu - chi phí - tiền phạt - lợi nhuận, quản lý nhân viên và cập nhật thông tin liên hệ cùng các thiết lập cảnh báo của hệ thống.
