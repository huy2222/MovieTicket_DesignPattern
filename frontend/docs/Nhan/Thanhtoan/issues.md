# Nhật ký giải quyết sự cố: Lỗi "Sai chữ ký" (Invalid Signature) VNPAY

## 1. Vấn đề gặp phải
Khi người dùng thực hiện thao tác đặt vé và chọn thanh toán qua cổng VNPAY, hệ thống chuyển hướng sang trang thanh toán của VNPAY nhưng thay vì hiển thị giao diện nhập thông tin thẻ, hệ thống lại báo lỗi **"Sai chữ ký" (Invalid Signature)**.
Lỗi này xảy ra dù đã kiểm tra và sử dụng đúng cặp khóa `tmnCode` và `hashSecret` mới nhất được cấp từ môi trường Sandbox của VNPAY.

## 2. Nguyên nhân gốc rễ
Sự cố phát sinh do sự bất đồng bộ trong cách **mã hóa dữ liệu (URL Encoding)** khi tạo chữ ký bảo mật (`vnp_SecureHash`) và khi tạo URL truy vấn (`query URL`) gửi đi:
- Code cũ khi tạo chuỗi `hashData` (dùng để băm ra chữ ký SHA-512) đã gộp trực tiếp tên trường và giá trị một cách nguyên bản (raw data).
- Trong khi đó, chuỗi URL gửi đi lại dùng `URLEncoder.encode()` để mã hóa giá trị (đổi khoảng trắng và các ký tự đặc biệt).
- **Tiêu chuẩn VNPAY 2.1.0** yêu cầu nghiêm ngặt rằng **tất cả giá trị** tham gia vào việc tạo ra chuỗi hash cũng phải được mã hóa thông qua chuẩn `URLEncoder` trước khi đưa vào hàm băm bảo mật. Vì chữ ký hệ thống tính toán (raw data) khác biệt so với chữ ký server VNPAY tính toán (dựa trên URL encoded data), VNPAY từ chối và báo lỗi.

## 3. Những cách đã thử nhưng thất bại
Trong quá trình debug, một số giả thuyết và cách fix đã được thử nhưng không mang lại kết quả:
- **Tạo lại khóa API:** Thử reset và cấp mới lại `tmnCode` và `hashSecret` liên tục vì nghi ngờ hệ thống Sandbox chưa nhận khóa. -> *Thất bại.*
- **Xử lý cấu hình IPv6:** Nhận thấy địa chỉ IP có thể bị lấy dưới dạng IPv6 loopback (`0:0:0:0:0:0:0:1`) nên đã thiết lập bắt buộc lấy theo chuẩn IPv4 (`127.0.0.1`). -> *Vẫn lỗi chữ ký.*
- **Xóa tham số `vnp_SecureHashType`:** Trong bản cập nhật mới, VNPAY không còn sử dụng trường này để sinh chữ ký. Mặc dù đã loại bỏ nó ra khỏi quá trình hash, nhưng lỗi sai chữ ký vẫn diễn ra.
- **Chỉnh sửa Replace dấu `+` bằng `%20`:** Có thử can thiệp vào chuẩn URL Encoding của Java bằng cách đổi `+` thành `%20` ở phần sinh URL (nhưng lại bỏ quên phần `hashData`). -> *Thất bại vì tạo ra thêm sự bất đồng bộ.*

## 4. Cách khắc phục thành công
Giải pháp triệt để là **Đồng bộ hóa tuyệt đối quá trình Encoding** cho cả hai chuỗi `hashData` và `query` trong file `VNPayService.java`:
1. Sử dụng thư viện chuẩn của Java: `URLEncoder.encode(..., StandardCharsets.US_ASCII.toString())` để mã hóa **tất cả các trường (cả fieldName và fieldValue)**.
2. Áp dụng mã hóa URL này trực tiếp ngay khi đang nối chuỗi `hashData` thay vì nối raw value như cũ.
3. Đồng bộ chuẩn này không chỉ cho hàm tạo URL gửi đi (`createPaymentUrl`) mà còn dùng đúng nguyên tắc đó cho hàm xác thực URL trả về (`verifyPayment`).
4. Giữ nguyên hành vi Encoding mặc định của hệ thống Java, loại bỏ việc tự ý thay thế (`replace("+", "%20")`) để VNPAY tự do khớp dữ liệu sinh ra bởi hàm mã hoá chuẩn.

Sau khi đồng bộ toàn bộ logic mã hóa dữ liệu tạo chữ ký và dữ liệu query, thao tác thanh toán đã thành công chuyển hướng đến giao diện thanh toán Sandbox của VNPAY.
