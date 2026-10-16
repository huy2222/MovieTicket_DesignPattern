# 🎬 Checklist - Chức năng Quản lý Khuyến mãi (Admin)

> **Mục tiêu**: Admin có thể tạo Voucher, áp dụng vào hệ thống, tạm ngưng Voucher.  
> **Design Pattern**: **Decorator Pattern** — bọc các loại Voucher khác nhau (giảm giá %, mua 1 tặng 1, giảm khi mua N vé...).  
> **Quy tắc**: Khách hàng phải nhập **mã voucher** thì mới được áp dụng khuyến mãi.

---

## 📌 Tổng quan kiến trúc Decorator Pattern

```
┌─────────────────────────────────────┐
│         «interface»                 │
│       VoucherComponent              │
│  ─────────────────────────────────  │
│  + getDescription(): String         │
│  + applyDiscount(booking): double   │
│  + getVoucherType(): String         │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────────────┐
    │                     │
┌───▼──────────┐   ┌─────▼──────────────┐
│ BaseVoucher  │   │ VoucherDecorator   │
│ (Concrete)   │   │ (Abstract)         │
│              │   │ wraps a            │
│ Không giảm   │   │ VoucherComponent   │
│ giá gì cả   │   └─────┬─────────────┘
└──────────────┘         │
                  ┌──────┼──────────────┐
                  │      │              │
           ┌──────▼┐  ┌──▼────────┐  ┌──▼──────────┐
           │Percent│  │BuyNGetFree│  │MinTicket     │
           │Discount│ │Decorator  │  │Discount      │
           │Decorator│ │           │  │Decorator     │
           └────────┘  └──────────┘  └─────────────┘
```

**Giải thích**: 
- `BaseVoucher`: Voucher gốc, không có khuyến mãi (trả về giá gốc).
- `PercentDiscountDecorator`: Bọc thêm logic giảm giá theo % (VD: giảm 20%).
- `BuyNGetFreeDecorator`: Bọc thêm logic mua N tặng M (VD: mua 1 tặng 1 → mua 2 vé chỉ tính tiền 1).
- `MinTicketDiscountDecorator`: Bọc thêm logic giảm giá khi mua tối thiểu N vé (VD: giảm 20% khi mua ≥ 2 vé).
- Có thể **chồng nhiều decorator** lên nhau nếu cần kết hợp nhiều loại khuyến mãi.

---

---

# 🖥️ PHẦN 1: FRONTEND (React + Vite + TailwindCSS)

---

## Step 1: Tạo trang Admin Layout & Route

> **Mục đích**: Tạo layout riêng cho Admin và thêm route `/admin/vouchers`.

### 📁 Files cần tạo/sửa:
- `frontend/src/components/layout/AdminSidebar.jsx` — Sidebar điều hướng cho admin
- `frontend/src/components/layout/AdminSidebar.css` — Style cho sidebar
- `frontend/src/components/layout/AdminLayout.jsx` — Layout wrapper cho trang admin (sidebar + content area)
- `frontend/src/components/layout/AdminLayout.css` — Style cho layout
- `frontend/src/routes/AppRoutes.jsx` — Thêm route admin

### 🔧 Hướng dẫn:

**1.1. Tạo `AdminSidebar.jsx`**
```jsx
// Tạo sidebar với các link điều hướng:
// - Dashboard (/admin)
// - Quản lý Khuyến mãi (/admin/vouchers)  ← đây là trang chính
// - (Các chức năng admin khác sau này)
// Sidebar nên có logo CINEMAX, nút đóng/mở, highlight active link
```

**1.2. Tạo `AdminLayout.jsx`**
```jsx
// Layout gồm:
// - AdminSidebar ở bên trái
// - Khu vực nội dung chính bên phải (dùng <Outlet /> của react-router-dom)
// Kiểm tra role === 'ADMIN' trước khi render, nếu không phải admin → redirect về /login
```

**1.3. Cập nhật `AppRoutes.jsx`**
```jsx
// Thêm route group cho admin:
// <Route path="/admin" element={<AdminLayout />}>
//   <Route path="vouchers" element={<VoucherManagementPage />} />
// </Route>
```

---

## Step 2: Tạo Service gọi API Voucher

> **Mục đích**: Tạo file service chứa các hàm gọi API CRUD voucher từ frontend tới backend.

### 📁 Files cần tạo:
- `frontend/src/services/voucherService.js`

### 🔧 Hướng dẫn:

```js
import api from "../api/axiosConfig";

// Lấy danh sách tất cả voucher
export const getAllVouchers = () => api.get("/admin/vouchers");

// Lấy chi tiết 1 voucher
export const getVoucherById = (id) => api.get(`/admin/vouchers/${id}`);

// Tạo voucher mới
export const createVoucher = (data) => api.post("/admin/vouchers", data);

// Cập nhật voucher
export const updateVoucher = (id, data) => api.put(`/admin/vouchers/${id}`, data);

// Kích hoạt voucher (DRAFT/SUSPENDED → ACTIVE)
export const activateVoucher = (id) => api.patch(`/admin/vouchers/${id}/activate`);

// Tạm ngưng voucher (ACTIVE → SUSPENDED)
export const suspendVoucher = (id) => api.patch(`/admin/vouchers/${id}/suspend`);

// Xoá voucher (chỉ khi DRAFT)
export const deleteVoucher = (id) => api.delete(`/admin/vouchers/${id}`);
```

---

## Step 3: Tạo trang Quản lý Voucher (VoucherManagementPage)

> **Mục đích**: Trang chính hiển thị danh sách voucher dưới dạng bảng, có nút Tạo/Sửa/Ngưng/Xoá.

### 📁 Files cần tạo:
- `frontend/src/pages/Admin/VoucherManagementPage.jsx`
- `frontend/src/pages/Admin/VoucherManagementPage.css`

### 🔧 Hướng dẫn:

**3.1. Cấu trúc trang:**
```
┌──────────────────────────────────────────────┐
│  Quản lý Khuyến mãi          [+ Tạo Voucher]│
├──────────────────────────────────────────────┤
│ 🔍 Tìm kiếm...    │ Lọc: Tất cả ▼          │
├──────┬───────┬──────┬────────┬───────┬───────┤
│ Tên  │  Mã   │ Loại │ Trạng  │ Hạn   │Hành  │
│      │       │      │ thái   │       │động  │
├──────┼───────┼──────┼────────┼───────┼───────┤
│ ...  │ ...   │ ...  │  🟢    │ ...   │ ✏️🔴 │
└──────┴───────┴──────┴────────┴───────┴───────┘
```

**3.2. Các chức năng chính:**
- Hiển thị danh sách voucher (gọi `getAllVouchers()` khi mount)
- Thanh tìm kiếm theo tên/mã voucher
- Bộ lọc theo trạng thái (DRAFT, ACTIVE, SUSPENDED, EXPIRED)
- Badge màu cho trạng thái:
  - 🟡 DRAFT (vàng) — Bản nháp, chưa áp dụng
  - 🟢 ACTIVE (xanh lá) — Đang hoạt động
  - 🔴 SUSPENDED (đỏ) — Tạm ngưng
  - ⚫ EXPIRED (xám) — Hết hạn
- Hiển thị cột **"Loại"** voucher: `PERCENT_DISCOUNT`, `BUY_N_GET_FREE`, `MIN_TICKET_DISCOUNT`
- Các nút hành động:
  - ✏️ **Sửa** → Mở modal chỉnh sửa
  - ▶️ **Kích hoạt** → Gọi `activateVoucher(id)` (chỉ hiện khi DRAFT/SUSPENDED)
  - ⏸️ **Tạm ngưng** → Gọi `suspendVoucher(id)` (chỉ hiện khi ACTIVE)
  - 🗑️ **Xoá** → Gọi `deleteVoucher(id)` (chỉ hiện khi DRAFT)

---

## Step 4: Tạo Modal Tạo/Sửa Voucher (VoucherFormModal)

> **Mục đích**: Form cho Admin tạo mới hoặc chỉnh sửa Voucher. Đây là nơi chọn loại Decorator.

### 📁 Files cần tạo:
- `frontend/src/components/voucher/VoucherFormModal.jsx`
- `frontend/src/components/voucher/VoucherFormModal.css`

### 🔧 Hướng dẫn:

**4.1. Cấu trúc form:**
```
┌─────────────────────────────────────┐
│  ✖  Tạo Voucher Mới                │
├─────────────────────────────────────┤
│ Tên voucher:  [________________]   │
│ Mã voucher:   [________________]   │
│ Mô tả:        [________________]   │
│                                     │
│ ── Loại khuyến mãi ──              │
│ ○ Giảm giá theo %                  │
│   → Phần trăm giảm: [20] %        │
│ ○ Mua N tặng M                     │
│   → Mua [2] vé, tặng [1] vé       │
│ ○ Giảm giá khi mua tối thiểu N vé │
│   → Mua tối thiểu [2] vé          │
│   → Phần trăm giảm: [20] %        │
│                                     │
│ ── Điều kiện áp dụng ──            │
│ Đơn tối thiểu: [100000] VNĐ       │
│ Giới hạn sử dụng: [100] lượt      │
│ Ngày bắt đầu: [____/____/____]    │
│ Ngày kết thúc: [____/____/____]    │
│                                     │
│        [Huỷ]    [Lưu Voucher]      │
└─────────────────────────────────────┘
```

**4.2. Logic quan trọng:**
- Khi chọn loại khuyến mãi, hiển thị/ẩn các field tương ứng (conditional rendering)
- **Loại `PERCENT_DISCOUNT`**: Cần field `discountPercent` (VD: 20 → giảm 20%)
- **Loại `BUY_N_GET_FREE`**: Cần field `buyQuantity` và `freeQuantity` (VD: mua 2, tặng 1)
- **Loại `MIN_TICKET_DISCOUNT`**: Cần field `minTickets` và `discountPercent` (VD: mua ≥ 2 vé → giảm 20%)
- Khi Lưu → Gọi `createVoucher(data)` hoặc `updateVoucher(id, data)`
- Voucher mới tạo sẽ ở trạng thái **DRAFT** (chưa áp dụng cho hệ thống)

**4.3. Data gửi lên Backend (request body):**
```json
{
  "name": "Giảm 20% mua 2 vé",
  "code": "SALE20",
  "description": "Giảm giá 20% khi mua từ 2 vé trở lên",
  "voucherType": "MIN_TICKET_DISCOUNT",
  "discountPercent": 20,
  "minTickets": 2,
  "buyQuantity": null,
  "freeQuantity": null,
  "minimumOrderAmount": 100000,
  "usageLimit": 100,
  "startTime": "2026-07-01T00:00:00",
  "endTime": "2026-07-31T23:59:59"
}
```

---

## Step 5: Tạo Component hiển thị Preview Voucher

> **Mục đích**: Card nhỏ hiển thị thông tin voucher đẹp mắt (dùng trong danh sách hoặc xem chi tiết).

### 📁 Files cần tạo:
- `frontend/src/components/voucher/VoucherCard.jsx`
- `frontend/src/components/voucher/VoucherCard.css`

### 🔧 Hướng dẫn:

```
┌─────────────────────────────────┐
│  🎫 SALE20                     │
│  ──────────────────────────     │
│  Giảm 20% khi mua 2 vé         │
│  Trạng thái: 🟢 ACTIVE         │
│  Hạn: 01/07/2026 → 31/07/2026  │
│  Đã dùng: 45/100 lượt          │
│  ──────────────────────────     │
│  [Tạm ngưng]    [Chỉnh sửa]   │
└─────────────────────────────────┘
```

- Hiển thị mã voucher nổi bật (font lớn, màu đậm)
- Mô tả ngắn gọn loại khuyến mãi
- Progress bar cho số lượt đã dùng / giới hạn
- Nút hành động phù hợp với trạng thái hiện tại

---

---

# ⚙️ PHẦN 2: BACKEND (Spring Boot + JPA + Decorator Pattern)

---

## Step 6: Tạo Enum `VoucherType`

> **Mục đích**: Định nghĩa các loại voucher để lưu vào DB và map với Decorator tương ứng.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/enums/VoucherType.java`

### 🔧 Hướng dẫn:

```java
package org.example.backend.enums;

public enum VoucherType {
    PERCENT_DISCOUNT,      // Giảm giá theo %
    BUY_N_GET_FREE,        // Mua N tặng M
    MIN_TICKET_DISCOUNT    // Giảm giá khi mua tối thiểu N vé
}
```

---

## Step 7: Cập nhật Entity `Voucher`

> **Mục đích**: Thêm các field mới để lưu thông tin loại voucher và điều kiện áp dụng.

### 📁 Files cần sửa:
- `backend/src/main/java/org/example/backend/entity/Voucher.java`

### 🔧 Hướng dẫn:

Thêm các field sau vào entity `Voucher`:

```java
// Loại voucher — dùng để biết nên dùng Decorator nào
@Enumerated(EnumType.STRING)
private VoucherType voucherType;

// Phần trăm giảm giá (dùng cho PERCENT_DISCOUNT và MIN_TICKET_DISCOUNT)
private Double discountPercent;

// Số vé cần mua (dùng cho BUY_N_GET_FREE)
private Integer buyQuantity;

// Số vé được tặng (dùng cho BUY_N_GET_FREE)
private Integer freeQuantity;

// Số vé tối thiểu cần mua (dùng cho MIN_TICKET_DISCOUNT)
private Integer minTickets;
```

> ⚠️ **Lưu ý**: Field `discountValue` cũ có thể giữ lại hoặc xoá tuỳ nhu cầu. Các field mới sẽ được Decorator sử dụng.

---

## Step 8: Tạo Decorator Pattern (Core Logic)

> **Mục đích**: Implement Decorator Pattern cho việc tính toán khuyến mãi.

### 📁 Files cần tạo:
```
backend/src/main/java/org/example/backend/decorator/
├── VoucherComponent.java           ← Interface
├── BaseVoucher.java                ← Concrete Component
├── VoucherDecorator.java           ← Abstract Decorator
├── PercentDiscountDecorator.java   ← Giảm % trên tổng giá
├── BuyNGetFreeDecorator.java       ← Mua N tặng M
└── MinTicketDiscountDecorator.java ← Giảm % khi mua ≥ N vé
```

### 🔧 Hướng dẫn:

**8.1. `VoucherComponent.java` (Interface)**
```java
package org.example.backend.decorator;

public interface VoucherComponent {
    // Mô tả voucher
    String getDescription();
    
    // Tính giá sau khi áp dụng voucher
    // originalPrice: tổng giá gốc của booking
    // ticketCount: số lượng vé trong booking
    double calculatePrice(double originalPrice, int ticketCount);
}
```

**8.2. `BaseVoucher.java` (Concrete Component)**
```java
package org.example.backend.decorator;

public class BaseVoucher implements VoucherComponent {
    @Override
    public String getDescription() {
        return "Voucher gốc (không giảm giá)";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        return originalPrice; // Trả về giá gốc, không giảm
    }
}
```

**8.3. `VoucherDecorator.java` (Abstract Decorator)**
```java
package org.example.backend.decorator;

public abstract class VoucherDecorator implements VoucherComponent {
    protected VoucherComponent wrappedVoucher;

    public VoucherDecorator(VoucherComponent wrappedVoucher) {
        this.wrappedVoucher = wrappedVoucher;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription();
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        return wrappedVoucher.calculatePrice(originalPrice, ticketCount);
    }
}
```

**8.4. `PercentDiscountDecorator.java`**
```java
package org.example.backend.decorator;

// Giảm giá theo phần trăm trên tổng giá
// VD: discountPercent = 20 → giảm 20% tổng giá
public class PercentDiscountDecorator extends VoucherDecorator {
    private final double discountPercent;

    public PercentDiscountDecorator(VoucherComponent wrappedVoucher, double discountPercent) {
        super(wrappedVoucher);
        this.discountPercent = discountPercent;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() + " + Giảm " + discountPercent + "%";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        return price * (1 - discountPercent / 100.0);
    }
}
```

**8.5. `BuyNGetFreeDecorator.java`**
```java
package org.example.backend.decorator;

// Mua N vé tặng M vé (tính tiền N vé thay vì N+M vé)
// VD: buyQuantity=1, freeQuantity=1 → Mua 1 tặng 1
public class BuyNGetFreeDecorator extends VoucherDecorator {
    private final int buyQuantity;
    private final int freeQuantity;

    public BuyNGetFreeDecorator(VoucherComponent wrappedVoucher, int buyQuantity, int freeQuantity) {
        super(wrappedVoucher);
        this.buyQuantity = buyQuantity;
        this.freeQuantity = freeQuantity;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() + " + Mua " + buyQuantity + " tặng " + freeQuantity;
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        if (ticketCount <= 0) return price;

        double pricePerTicket = price / ticketCount;
        int groupSize = buyQuantity + freeQuantity;
        int fullGroups = ticketCount / groupSize;
        int remainder = ticketCount % groupSize;

        // Tính: mỗi nhóm (buy+free) chỉ tính tiền buy vé
        int paidTickets = fullGroups * buyQuantity + Math.min(remainder, buyQuantity);
        return paidTickets * pricePerTicket;
    }
}
```

**8.6. `MinTicketDiscountDecorator.java`**
```java
package org.example.backend.decorator;

// Giảm giá khi mua tối thiểu N vé
// VD: minTickets=2, discountPercent=20 → Mua ≥ 2 vé thì giảm 20%
public class MinTicketDiscountDecorator extends VoucherDecorator {
    private final int minTickets;
    private final double discountPercent;

    public MinTicketDiscountDecorator(VoucherComponent wrappedVoucher, int minTickets, double discountPercent) {
        super(wrappedVoucher);
        this.minTickets = minTickets;
        this.discountPercent = discountPercent;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() + " + Giảm " + discountPercent + "% khi mua từ " + minTickets + " vé";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        // Chỉ áp dụng giảm giá nếu số vé >= minTickets
        if (ticketCount >= minTickets) {
            return price * (1 - discountPercent / 100.0);
        }
        return price; // Không đủ điều kiện → giữ nguyên giá
    }
}
```

---

## Step 9: Tạo Factory để build Decorator từ Entity

> **Mục đích**: Factory đọc thông tin từ entity `Voucher` trong DB và tạo ra đúng Decorator chain.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/decorator/VoucherFactory.java`

### 🔧 Hướng dẫn:

```java
package org.example.backend.decorator;

import org.example.backend.entity.Voucher;
import org.springframework.stereotype.Component;

@Component
public class VoucherFactory {

    /**
     * Dựa vào entity Voucher (từ DB), tạo ra VoucherComponent tương ứng.
     * Đây là nơi "lắp ráp" Decorator dựa trên voucherType.
     */
    public VoucherComponent createVoucherComponent(Voucher voucher) {
        VoucherComponent component = new BaseVoucher();

        switch (voucher.getVoucherType()) {
            case PERCENT_DISCOUNT:
                component = new PercentDiscountDecorator(component, voucher.getDiscountPercent());
                break;
            case BUY_N_GET_FREE:
                component = new BuyNGetFreeDecorator(component, voucher.getBuyQuantity(), voucher.getFreeQuantity());
                break;
            case MIN_TICKET_DISCOUNT:
                component = new MinTicketDiscountDecorator(component, voucher.getMinTickets(), voucher.getDiscountPercent());
                break;
        }

        return component;
    }
}
```

---

## Step 10: Tạo DTO Request/Response cho Voucher

> **Mục đích**: Tạo các DTO để truyền dữ liệu giữa frontend ↔ backend.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/dto/request/VoucherRequest.java`
- `backend/src/main/java/org/example/backend/dto/response/VoucherResponse.java`

### 🔧 Hướng dẫn:

**10.1. `VoucherRequest.java`**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherRequest {
    private String name;
    private String code;
    private String description;
    private String voucherType;       // "PERCENT_DISCOUNT", "BUY_N_GET_FREE", "MIN_TICKET_DISCOUNT"
    private Double discountPercent;   // Dùng cho PERCENT_DISCOUNT, MIN_TICKET_DISCOUNT
    private Integer buyQuantity;      // Dùng cho BUY_N_GET_FREE
    private Integer freeQuantity;     // Dùng cho BUY_N_GET_FREE
    private Integer minTickets;       // Dùng cho MIN_TICKET_DISCOUNT
    private Double minimumOrderAmount;
    private Integer usageLimit;
    private String startTime;         // ISO format: "2026-07-01T00:00:00"
    private String endTime;
}
```

**10.2. `VoucherResponse.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String voucherType;
    private Double discountPercent;
    private Integer buyQuantity;
    private Integer freeQuantity;
    private Integer minTickets;
    private Double minimumOrderAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private String startTime;
    private String endTime;
    private String decoratorDescription;  // Mô tả từ Decorator (VD: "Giảm 20% khi mua từ 2 vé")
}
```

---

## Step 11: Tạo Repository cho Voucher

> **Mục đích**: Tạo JPA Repository để truy vấn Voucher từ DB.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/repository/VoucherRepository.java`

### 🔧 Hướng dẫn:

```java
package org.example.backend.repository;

import org.example.backend.entity.Voucher;
import org.example.backend.enums.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    // Tìm voucher theo mã code
    Optional<Voucher> findByCode(String code);
    
    // Kiểm tra mã code đã tồn tại chưa
    boolean existsByCode(String code);
    
    // Lấy danh sách voucher theo trạng thái
    List<Voucher> findByStatus(VoucherStatus status);
    
    // Tìm voucher theo tên (chứa keyword)
    List<Voucher> findByNameContainingIgnoreCase(String name);
}
```

---

## Step 12: Tạo Service Voucher (VoucherService)

> **Mục đích**: Xử lý business logic: tạo, sửa, kích hoạt, tạm ngưng, và áp dụng voucher.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/service/VoucherService.java`

### 🔧 Hướng dẫn:

```java
@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherFactory voucherFactory;

    // Constructor injection...

    // 1. Lấy tất cả voucher
    public List<VoucherResponse> getAllVouchers() { ... }

    // 2. Lấy chi tiết 1 voucher + mô tả từ Decorator
    public VoucherResponse getVoucherById(Long id) { 
        Voucher voucher = voucherRepository.findById(id)...;
        VoucherComponent component = voucherFactory.createVoucherComponent(voucher);
        // Dùng component.getDescription() để lấy mô tả Decorator
        ...
    }

    // 3. Tạo voucher mới (status = DRAFT)
    public VoucherResponse createVoucher(VoucherRequest request) {
        // Kiểm tra mã code đã tồn tại chưa
        // Map request → entity
        // Set status = DRAFT
        // Save & return response
    }

    // 4. Cập nhật voucher (chỉ khi DRAFT)
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) { ... }

    // 5. Kích hoạt voucher (DRAFT/SUSPENDED → ACTIVE)
    public VoucherResponse activateVoucher(Long id) {
        // Chuyển status sang ACTIVE
        // Từ đây, khách hàng có thể dùng mã voucher
    }

    // 6. Tạm ngưng voucher (ACTIVE → SUSPENDED)
    public VoucherResponse suspendVoucher(Long id) {
        // Chuyển status sang SUSPENDED
        // Khách hàng không thể dùng voucher này nữa
    }

    // 7. Xoá voucher (chỉ khi DRAFT)
    public void deleteVoucher(Long id) { ... }

    // 8. Áp dụng voucher cho booking (khách hàng nhập mã)
    public double applyVoucher(String code, double originalPrice, int ticketCount) {
        Voucher voucher = voucherRepository.findByCode(code)...;
        
        // Kiểm tra voucher có ACTIVE không
        // Kiểm tra hạn sử dụng
        // Kiểm tra số lượt dùng
        // Kiểm tra đơn tối thiểu
        
        VoucherComponent component = voucherFactory.createVoucherComponent(voucher);
        return component.calculatePrice(originalPrice, ticketCount);
    }
}
```

---

## Step 13: Tạo Controller Voucher (VoucherController)

> **Mục đích**: Expose các API endpoint cho frontend gọi.

### 📁 Files cần tạo:
- `backend/src/main/java/org/example/backend/controller/VoucherController.java`

### 🔧 Hướng dẫn:

```java
@RestController
@RequestMapping("/api/admin/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    // GET    /api/admin/vouchers          → Lấy tất cả voucher
    // GET    /api/admin/vouchers/{id}     → Lấy chi tiết voucher
    // POST   /api/admin/vouchers          → Tạo voucher mới
    // PUT    /api/admin/vouchers/{id}     → Cập nhật voucher
    // PATCH  /api/admin/vouchers/{id}/activate  → Kích hoạt
    // PATCH  /api/admin/vouchers/{id}/suspend   → Tạm ngưng
    // DELETE /api/admin/vouchers/{id}     → Xoá voucher
}
```

---

## Step 14: Cập nhật Security Config

> **Mục đích**: Cho phép endpoint `/api/admin/**` chỉ truy cập bởi role ADMIN.

### 📁 Files cần sửa:
- `backend/src/main/java/org/example/backend/config/SecurityConfig.java`

### 🔧 Hướng dẫn:

Thêm vào phần `authorizeHttpRequests`:
```java
.requestMatchers("/api/admin/**").hasAuthority("ADMIN")
```

> ⚠️ Đảm bảo JWT token chứa thông tin role, và `JwtAuthenticationFilter` đã set đúng `GrantedAuthority` khi parse token.

---

## Step 15: Cập nhật `JwtAuthenticationFilter` để set Role vào SecurityContext

> **Mục đích**: Đảm bảo khi parse JWT, role của user được set vào `SecurityContext` để Spring Security kiểm tra quyền.

### 📁 Files cần kiểm tra/sửa:
- `backend/src/main/java/org/example/backend/config/JwtAuthenticationFilter.java`
- `backend/src/main/java/org/example/backend/security/JwtService.java`

### 🔧 Hướng dẫn:

Kiểm tra `JwtAuthenticationFilter` đã:
1. Parse JWT → lấy `email` và `role` từ claims
2. Tạo `UsernamePasswordAuthenticationToken` với `authorities` chứa role
3. Set vào `SecurityContextHolder`

```java
// Trong JwtAuthenticationFilter:
String role = jwtService.extractRole(token); // Cần thêm method này nếu chưa có
List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
UsernamePasswordAuthenticationToken authToken = 
    new UsernamePasswordAuthenticationToken(email, null, authorities);
SecurityContextHolder.getContext().setAuthentication(authToken);
```

Kiểm tra `JwtService.generateToken()` đã lưu role vào JWT claims:
```java
// Trong JwtService.generateToken():
.claim("role", user.getRole().name())
```

---

---

# 🧪 PHẦN 3: KIỂM THỬ & HOÀN THIỆN

---

## Step 16: Test API bằng Postman/Thunder Client

> **Mục đích**: Test toàn bộ API trước khi kết nối frontend.

### 🔧 Checklist test:

- [ ] `POST /api/auth/login` — Login với tài khoản ADMIN → Lấy token
- [ ] `POST /api/admin/vouchers` — Tạo voucher loại `PERCENT_DISCOUNT` → Kiểm tra status = DRAFT
- [ ] `POST /api/admin/vouchers` — Tạo voucher loại `BUY_N_GET_FREE`
- [ ] `POST /api/admin/vouchers` — Tạo voucher loại `MIN_TICKET_DISCOUNT`
- [ ] `GET /api/admin/vouchers` — Lấy danh sách tất cả voucher
- [ ] `GET /api/admin/vouchers/{id}` — Lấy chi tiết + mô tả Decorator
- [ ] `PATCH /api/admin/vouchers/{id}/activate` — Kích hoạt voucher
- [ ] `PATCH /api/admin/vouchers/{id}/suspend` — Tạm ngưng voucher
- [ ] `DELETE /api/admin/vouchers/{id}` — Xoá voucher (chỉ DRAFT)
- [ ] Thử gọi API với token CUSTOMER → Phải bị 403 Forbidden

---

## Step 17: Kết nối Frontend ↔ Backend & Test toàn bộ luồng

> **Mục đích**: Chạy full flow từ UI admin.

### 🔧 Checklist test:

- [ ] Login admin → Redirect tới `/admin/vouchers`
- [ ] Hiển thị danh sách voucher (bảng có đầy đủ cột)
- [ ] Tạo voucher mới qua modal → Voucher xuất hiện trong bảng với status DRAFT
- [ ] Kích hoạt voucher → Status đổi thành ACTIVE (badge xanh)
- [ ] Tạm ngưng voucher → Status đổi thành SUSPENDED (badge đỏ)
- [ ] Sửa voucher (chỉ khi DRAFT)
- [ ] Xoá voucher (chỉ khi DRAFT)
- [ ] Tìm kiếm voucher theo tên/mã
- [ ] Lọc voucher theo trạng thái
- [ ] Decorator description hiển thị chính xác

---

## 📊 Tóm tắt Files cần tạo/sửa

### Frontend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `components/layout/AdminSidebar.jsx` + `.css` | Sidebar admin |
| 2 | `components/layout/AdminLayout.jsx` + `.css` | Layout admin |
| 3 | `services/voucherService.js` | Gọi API voucher |
| 4 | `pages/Admin/VoucherManagementPage.jsx` + `.css` | Trang quản lý |
| 5 | `components/voucher/VoucherFormModal.jsx` + `.css` | Form tạo/sửa |
| 6 | `components/voucher/VoucherCard.jsx` + `.css` | Card hiển thị |

### Frontend (Sửa):
| # | File | Thay đổi |
|---|------|----------|
| 1 | `routes/AppRoutes.jsx` | Thêm route `/admin/*` |

### Backend (Tạo mới):
| # | File | Mục đích |
|---|------|----------|
| 1 | `enums/VoucherType.java` | Enum loại voucher |
| 2 | `decorator/VoucherComponent.java` | Interface Decorator |
| 3 | `decorator/BaseVoucher.java` | Concrete Component |
| 4 | `decorator/VoucherDecorator.java` | Abstract Decorator |
| 5 | `decorator/PercentDiscountDecorator.java` | Giảm % |
| 6 | `decorator/BuyNGetFreeDecorator.java` | Mua N tặng M |
| 7 | `decorator/MinTicketDiscountDecorator.java` | Giảm khi mua ≥ N vé |
| 8 | `decorator/VoucherFactory.java` | Factory tạo Decorator |
| 9 | `dto/request/VoucherRequest.java` | DTO request |
| 10 | `dto/response/VoucherResponse.java` | DTO response |
| 11 | `repository/VoucherRepository.java` | JPA Repository |
| 12 | `service/VoucherService.java` | Business logic |
| 13 | `controller/VoucherController.java` | REST Controller |

### Backend (Sửa):
| # | File | Thay đổi |
|---|------|----------|
| 1 | `entity/Voucher.java` | Thêm fields mới |
| 2 | `config/SecurityConfig.java` | Thêm rule `/api/admin/**` |
| 3 | `config/JwtAuthenticationFilter.java` | Set role vào SecurityContext |
| 4 | `security/JwtService.java` | Thêm `extractRole()` nếu chưa có |
