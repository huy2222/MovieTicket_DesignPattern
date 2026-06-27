# Checklist & Guide: Fix Lỗi VNPay Return URL cho CineMeet (Phương án 1)

Phương án 1 tập trung vào việc cho phép truyền Return URL động khi tạo thanh toán, giúp tách biệt luồng xử lý của Booking thường và CineMeet Group Booking.

## [ ] Step 1: Thêm biến cấu hình `vnpay.cinemeetReturnUrl` vào file `application.properties`
**Guide:**
Mở file `backend/src/main/resources/application.properties`. 
Tìm phần cấu hình `VNPAY CONFIGURATION`, ngay dưới biến `vnpay.returnUrl` hiện tại, hãy thêm một dòng mới cho CineMeet như sau:
```properties
vnpay.cinemeetReturnUrl=http://localhost:8081/api/cinemeet/group-bookings/vnpay-return
```
Mục đích: Cung cấp riêng một đường dẫn trả về trỏ đúng vào `GroupBookingController`.

## [ ] Step 2: Cập nhật hàm `createPaymentUrl` trong `VNPayService.java`
**Guide:**
Mở file `backend/src/main/java/org/example/backend/service/VNPayService.java`.
Sửa lại định nghĩa của hàm `createPaymentUrl` để nhận thêm tham số thứ 5 là `String returnUrl`. 
Thay đổi dòng code `vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);` (dùng biến môi trường nội bộ) thành việc sử dụng tham số mới truyền vào.
Ví dụ:
```java
public String createPaymentUrl(HttpServletRequest request, long amount, String orderInfo, String txnRef, String returnUrl) {
    // ... các đoạn code khác ...
    vnp_Params.put("vnp_ReturnUrl", returnUrl); // Sử dụng tham số returnUrl
    // ... các đoạn code khác ...
}
```

## [ ] Step 3: Cập nhật lời gọi hàm tại `BookingService.java`
**Guide:**
Mở file `backend/src/main/java/org/example/backend/service/BookingService.java`.
Tiêm biến môi trường returnUrl của booking vào class bằng cách thêm:
```java
@Value("${vnpay.returnUrl}")
private String bookingReturnUrl;
```
Tìm đoạn code đang gọi `vnPayService.createPaymentUrl(...)` và truyền thêm tham số `bookingReturnUrl` vào cuối danh sách tham số.
Ví dụ:
```java
String paymentUrl = vnPayService.createPaymentUrl(httpRequest, (long) discountedPrice, orderInfo, txnRef, bookingReturnUrl);
```

## [ ] Step 4: Cập nhật lời gọi hàm tại `GroupBookingService.java` (CineMeet)
**Guide:**
Mở file `backend/src/main/java/org/example/backend/service/GroupBookingService.java`.
Tiêm biến môi trường returnUrl của CineMeet vào class bằng cách thêm:
```java
@Value("${vnpay.cinemeetReturnUrl}")
private String cinemeetReturnUrl;
```
Tìm đoạn code đang gọi `vnPayService.createPaymentUrl(...)` trong hàm `createVNPayUrl` và truyền thêm tham số `cinemeetReturnUrl` vào cuối danh sách tham số.
Ví dụ:
```java
return vnPayService.createPaymentUrl(request, (long) member.getAmount(), orderInfo, txnRef, cinemeetReturnUrl);
```

## [ ] Step 5: Khởi động lại Server và Kiểm tra (Test)
**Guide:**
Sau khi lưu toàn bộ các thay đổi trên:
1. Chạy lại backend server.
2. Mở trình duyệt, vào phần CineMeet thực hiện thanh toán lại.
3. Chắc chắn rằng trên URL của trang VNPay Sandbox, tham số `vnp_ReturnUrl` lúc này chứa đoạn `/api/cinemeet/group-bookings/vnpay-return`.
4. Sau khi nhập OTP và thành công, hệ thống phải báo "Thanh toán thành công!" thay vì "Thanh toán thất bại" như trước.
