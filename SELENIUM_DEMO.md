# Demo Selenium: Báo cáo vi phạm CineMeet

## Phạm vi demo

Bộ Selenium hiện tại chỉ gồm đúng hai kịch bản nghiệp vụ:

1. **Báo cáo người dùng vi phạm trong CineMeet**
   - Tạo hai khách hàng thử nghiệm và một match CineMeet.
   - Đăng nhập bằng tài khoản người báo cáo trên giao diện.
   - Mở chức năng báo cáo từ match.
   - Kiểm tra không thể gửi khi chưa chọn lý do.
   - Chọn lý do `Quấy rối hoặc bắt nạt`, nhập mô tả và gửi báo cáo.
   - Kiểm tra thông báo thành công và báo cáo xuất hiện trong `Báo cáo của tôi` với trạng thái `Chờ xử lý`.

2. **Quản lý và xử lý báo cáo CineMeet**
   - Tạo một báo cáo `Spam hoặc làm phiền` làm dữ liệu đầu vào.
   - Đăng nhập bằng tài khoản quản trị trên giao diện.
   - Mở trang `Quản lý báo cáo`, tìm đúng báo cáo theo ID và xem chi tiết.
   - Tiếp nhận báo cáo để chuyển sang trạng thái `Đang xem xét`.
   - Nhập ghi chú xử lý và chọn `Xác nhận vi phạm`.
   - Kiểm tra trạng thái `Đã xác nhận`, ghi chú xử lý và thông báo thành công.

Các tài khoản và báo cáo đầu vào được tạo qua API nội bộ chỉ để chuẩn bị dữ liệu độc lập cho từng lần chạy. Toàn bộ thao tác nghiệp vụ cần demo và các assertion đều được thực hiện trên giao diện bằng Selenium WebDriver.

## Cấu trúc code

```text
backend/src/test/java/org/example/backend/selenium
├── base
│   └── BaseSeleniumTest.java
├── config
│   └── SeleniumConfig.java
├── pages
│   ├── BasePage.java
│   ├── LoginPage.java
│   ├── CineMeetPage.java
│   └── CineMeetReportAdminPage.java
├── support
│   └── SeleniumApi.java
└── tests
    ├── CineMeetUserReportSeleniumTest.java
    └── CineMeetReportManagementSeleniumTest.java
```

- `BaseSeleniumTest`: mở/đóng Chrome và hỗ trợ chụp ảnh khi kịch bản thất bại.
- `SeleniumConfig`: đọc URL, timeout, chế độ headless và tài khoản admin.
- `BasePage`: cung cấp explicit wait, nhập dữ liệu và click phần tử.
- `CineMeetPage`: thao tác báo cáo người dùng và kiểm tra `Báo cáo của tôi`.
- `CineMeetReportAdminPage`: tìm, tiếp nhận và xử lý báo cáo trên trang admin.
- `SeleniumApi`: chỉ chuẩn bị tài khoản, hồ sơ CineMeet, match và báo cáo đầu vào.
- Hai lớp trong `tests`: chứa hai kịch bản nghiệp vụ dùng để demo.

## Điều kiện trước khi chạy

- Java 17 và Google Chrome đã được cài đặt.
- MySQL đang chạy với database thử nghiệm, không sử dụng database production.
- Backend chạy tại `http://localhost:8081`.
- Frontend chạy tại `http://localhost:5173`.
- Backend có tài khoản quản trị mặc định:
  - Email: `admin@admin.com`
  - Mật khẩu: `admin`
- Chrome và ChromeDriver tương thích. Selenium Manager sẽ tự tìm hoặc tải driver trong lần chạy đầu.

## Khởi động hệ thống

Mở PowerShell thứ nhất:

```powershell
cd E:\MovieTicket_DesignPattern\backend
.\mvnw.cmd spring-boot:run
```

Mở PowerShell thứ hai:

```powershell
cd E:\MovieTicket_DesignPattern\frontend
npm install
npm run dev
```

Kiểm tra `http://localhost:5173` truy cập được trước khi chạy Selenium.

## Chạy cả hai kịch bản

Mở PowerShell thứ ba:

```powershell
cd E:\MovieTicket_DesignPattern\backend
.\mvnw.cmd "-Dtest=CineMeetUserReportSeleniumTest,CineMeetReportManagementSeleniumTest" test
```

Chrome sẽ mở và tự thao tác. Không sử dụng chuột hoặc bàn phím trong cửa sổ Chrome cho đến khi test kết thúc.

Kết quả mong đợi:

```text
Tests run: 2, Failures: 0, Errors: 0
BUILD SUCCESS
```

## Chạy riêng từng kịch bản

Báo cáo người dùng vi phạm:

```powershell
.\mvnw.cmd "-Dtest=CineMeetUserReportSeleniumTest" test
```

Quản lý và xử lý báo cáo:

```powershell
.\mvnw.cmd "-Dtest=CineMeetReportManagementSeleniumTest" test
```

## Chạy ẩn trình duyệt

```powershell
.\mvnw.cmd "-Dtest=CineMeetUserReportSeleniumTest,CineMeetReportManagementSeleniumTest" "-Dselenium.headless=true" test
```

Khi quay demo nên giữ `selenium.headless=false` để quan sát thao tác tự động.

## Cấu hình

Giá trị mặc định nằm tại `backend/src/test/resources/selenium.properties`:

```properties
selenium.base-url=http://localhost:5173
selenium.api-url=http://localhost:8081/api
selenium.timeout-seconds=15
selenium.headless=false
selenium.admin-email=admin@admin.com
selenium.admin-password=admin
```

Có thể ghi đè bằng tham số Maven, ví dụ:

```powershell
.\mvnw.cmd "-Dtest=CineMeetReportManagementSeleniumTest" `
  "-Dselenium.base-url=http://localhost:5173" `
  "-Dselenium.admin-email=admin@admin.com" `
  "-Dselenium.admin-password=admin" test
```

Hoặc dùng các biến môi trường tương ứng:

```text
SELENIUM_BASE_URL
SELENIUM_API_URL
SELENIUM_TIMEOUT_SECONDS
SELENIUM_HEADLESS
SELENIUM_ADMIN_EMAIL
SELENIUM_ADMIN_PASSWORD
```

## Locator chính

Test ưu tiên `data-testid` để không phụ thuộc vào bố cục hoặc class CSS:

```text
cinemeet-report-match-{matchId}  nút báo cáo người dùng trong match
cinemeet-report-modal            modal tạo báo cáo
cinemeet-report-reason           danh sách lý do
cinemeet-report-description      mô tả bổ sung
cinemeet-report-submit           nút gửi báo cáo
cinemeet-my-reports              nút mở báo cáo của khách hàng
cmr-search                       ô tìm kiếm báo cáo của admin
cmr-row-{reportId}               dòng báo cáo cần xử lý
cmr-start-review                 nút tiếp nhận xử lý
cmr-resolution-note              ghi chú xử lý
cmr-resolve                      nút xác nhận vi phạm
cmr-detail-status                trạng thái hiện tại của báo cáo
```

## Trình tự demo đề xuất

### Kịch bản 1: Khách hàng báo cáo vi phạm

1. Mở `CineMeetUserReportSeleniumTest.java` và giới thiệu dữ liệu thử nghiệm được tạo động.
2. Chạy riêng kịch bản thứ nhất.
3. Quan sát Chrome đăng nhập, mở CineMeet và chọn báo cáo một match.
4. Selenium thử gửi khi chưa chọn lý do để chứng minh validation hoạt động.
5. Selenium chọn lý do, nhập mô tả và gửi.
6. Selenium mở `Báo cáo của tôi` và xác nhận trạng thái `Chờ xử lý`.

### Kịch bản 2: Admin xử lý báo cáo

1. Mở `CineMeetReportManagementSeleniumTest.java`.
2. Chạy riêng kịch bản thứ hai.
3. Quan sát Chrome đăng nhập admin và mở trang quản lý báo cáo.
4. Selenium tìm báo cáo theo ID, kiểm tra người báo cáo, người bị báo cáo và mô tả.
5. Selenium nhấn `Tiếp nhận xử lý`, nhập ghi chú rồi nhấn `Xác nhận vi phạm`.
6. Selenium xác nhận trạng thái cuối cùng và ghi chú đã được lưu.

## Kết quả và ảnh lỗi

JUnit ghi báo cáo tại:

```text
backend\target\surefire-reports
```

Nếu một kịch bản thất bại, ảnh màn hình được lưu tại:

```text
backend\target\selenium-screenshots
```

## Lỗi thường gặp

- Test báo lỗi kết nối: frontend hoặc backend chưa chạy. Hai kịch bản luôn được thực thi và không tự động chuyển sang trạng thái `Skipped`.
- Không đăng nhập được admin: kiểm tra tài khoản cấu hình trong `selenium.properties` có tồn tại và đang `ACTIVE`.
- Không mở được Chrome: cập nhật Chrome, kiểm tra Internet ở lần Selenium Manager tải driver đầu tiên.
- Không thấy báo cáo: kiểm tra backend đang kết nối đúng database thử nghiệm và tài khoản admin có role `ADMIN`.
- Timeout: tăng `selenium.timeout-seconds` nếu máy chạy chậm.
- Dữ liệu demo được tạo theo email duy nhất mỗi lần chạy; sau test, hồ sơ CineMeet của các tài khoản demo sẽ được tắt tự động.
