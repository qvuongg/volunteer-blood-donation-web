# Hệ thống Xác thực Nhóm Máu (Phương án 3 - Hybrid)

## Tổng quan

Hệ thống cho phép người hiến máu tự khai báo nhóm máu khi đăng ký, và sau đó bệnh viện sẽ xác thực chính thức nhóm máu sau khi xét nghiệm.

## Quy trình

### 1. Người hiến máu mới đăng ký

- Khi đăng ký tài khoản, người dùng có thể tự khai báo nhóm máu (hoặc để trống nếu chưa biết)
- Trạng thái mặc định: **Chưa xác thực** (`nhom_mau_xac_nhan = FALSE`)
- Người hiến máu có thể cập nhật nhóm máu bất kỳ lúc nào trước khi được xác thực

### 2. Tham gia hiến máu

- Người hiến máu đăng ký và tham gia sự kiện hiến máu
- Bệnh viện thực hiện xét nghiệm nhóm máu

### 3. Bệnh viện xác thực

#### Truy cập trang xác thực:
```
Dashboard > Xác thực nhóm máu
hoặc trực tiếp: /hospital/blood-type-confirmation
```

#### Danh sách hiển thị:
- Những người đã hiến máu tại bệnh viện
- Nhóm máu chưa được xác thực chính thức
- Thông tin: Họ tên, Email, SĐT, Nhóm máu tự khai, Số lần hiến, Ngày hiến gần nhất

#### Hai tùy chọn xác thực:

**Tùy chọn 1: Xác nhận**
- Nhóm máu tự khai đúng với kết quả xét nghiệm
- Nhấn nút "Xác nhận"

**Tùy chọn 2: Điều chỉnh & Xác nhận**
- Nhóm máu tự khai khác với kết quả xét nghiệm
- Nhấn "Điều chỉnh & Xác nhận"
- Nhập nhóm máu chính xác (A, B, AB, O)
- Hệ thống lưu lại ghi chú về việc điều chỉnh

### 4. Sau khi xác thực

- Người hiến máu thấy badge "Đã xác thực" trên Dashboard
- Nhóm máu không thể thay đổi nữa
- Hiển thị thông tin: Bệnh viện xác thực, Ngày xác thực, Ghi chú

## Database Schema

### Bảng `nguoi_hien_mau`

```sql
CREATE TABLE nguoi_hien_mau (
    id_nguoi_hien INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_dung INT NOT NULL,
    nhom_mau VARCHAR(5) COMMENT 'Nhóm máu tự khai báo hoặc đã xác thực',
    lan_hien_gan_nhat DATE,
    tong_so_lan_hien INT DEFAULT 0,
    nhom_mau_xac_nhan BOOLEAN DEFAULT FALSE COMMENT 'Nhóm máu đã được bệnh viện xác thực',
    ngay_xac_nhan DATE COMMENT 'Ngày xác thực nhóm máu',
    id_benh_vien_xac_nhan INT COMMENT 'Bệnh viện xác thực nhóm máu',
    ghi_chu_xac_nhan TEXT COMMENT 'Ghi chú từ bệnh viện khi xác thực',
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoidung(id_nguoi_dung),
    FOREIGN KEY (id_benh_vien_xac_nhan) REFERENCES benh_vien(id_benh_vien)
);
```

## API Endpoints

### Người hiến máu

#### Xem thông tin nhóm máu
```
GET /api/donors/blood-info
```

Response:
```json
{
  "success": true,
  "data": {
    "donor": {
      "id_nguoi_hien": 1,
      "nhom_mau": "O",
      "nhom_mau_xac_nhan": true,
      "ngay_xac_nhan": "2024-01-15",
      "ten_benh_vien_xac_nhan": "Bệnh Viện Đa Khoa Đà Nẵng",
      "ghi_chu_xac_nhan": "Xác thực nhóm máu qua xét nghiệm"
    }
  }
}
```

#### Cập nhật nhóm máu (chỉ khi chưa xác thực)
```
PUT /api/donors/blood-info
Body: { "nhom_mau": "O" }
```

### Bệnh viện

#### Lấy danh sách cần xác thực
```
GET /api/hospitals/blood-types/unconfirmed
```

#### Xác thực nhóm máu
```
POST /api/hospitals/blood-types/confirm
Body: {
  "id_nguoi_hien": 1,
  "nhom_mau": "O",
  "ghi_chu": "Xác thực qua xét nghiệm"
}
```

## Luồng dữ liệu

```
┌─────────────────┐
│ Đăng ký mới     │
│ nhom_mau = NULL │
│ xac_nhan = FALSE│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tự khai báo     │
│ nhom_mau = "O"  │
│ xac_nhan = FALSE│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Hiến máu +      │
│ Xét nghiệm      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ BV xác thực     │
│ nhom_mau = "O"  │
│ xac_nhan = TRUE │
│ ngay_xac_nhan   │
│ id_benh_vien    │
└─────────────────┘
```

## Lưu ý quan trọng

### Cho Người hiến máu:
- Có thể cập nhật nhóm máu bất kỳ lúc nào trước khi được xác thực
- Sau khi xác thực, nhóm máu không thể thay đổi
- Nếu phát hiện sai sót, liên hệ trực tiếp với bệnh viện

### Cho Bệnh viện:
- Chỉ xác thực sau khi đã thực hiện xét nghiệm chính thức
- Kiểm tra kỹ trước khi xác nhận (không thể hoàn tác)
- Nếu nhóm máu khác với tự khai, sử dụng "Điều chỉnh & Xác nhận"
- Ghi chú rõ ràng về quá trình xác thực

### Cho Admin:
- Nếu cần thay đổi nhóm máu đã xác thực, phải trực tiếp sửa trong database
- Lưu lại lịch sử thay đổi để audit

## Tính năng bảo mật

1. **Phân quyền**: Chỉ bệnh viện mới có thể xác thực nhóm máu
2. **Bất biến sau xác thực**: Người hiến máu không thể tự thay đổi sau khi đã xác thực
3. **Audit trail**: Lưu lại bệnh viện nào, ngày nào xác thực
4. **Validation**: Chỉ chấp nhận 4 nhóm máu: A, B, AB, O

## Testing

### Test cases

1. **Người hiến máu mới**
   - Đăng ký tài khoản
   - Không có nhóm máu
   - Badge hiển thị "Chưa xác nhận"

2. **Tự khai báo nhóm máu**
   - Vào trang Cập nhật nhóm máu
   - Chọn nhóm máu O
   - Lưu thành công
   - Form vẫn có thể chỉnh sửa

3. **Bệnh viện xác thực đúng**
   - Login bệnh viện
   - Vào trang Xác thực nhóm máu
   - Thấy người hiến máu (nhóm O, chưa xác thực)
   - Nhấn "Xác nhận"
   - Người biến mất khỏi danh sách

4. **Bệnh viện điều chỉnh**
   - Người tự khai nhóm A
   - Xét nghiệm thực tế nhóm B
   - Nhấn "Điều chỉnh & Xác nhận"
   - Nhập B
   - Lưu với ghi chú điều chỉnh

5. **Sau xác thực**
   - Login người hiến máu
   - Dashboard hiển thị badge "Đã xác thực"
   - Vào trang Cập nhật nhóm máu
   - Form bị disable
   - Hiển thị thông tin xác thực

## Migration từ hệ thống cũ

Nếu đang có dữ liệu cũ:

```sql
-- Update tất cả người hiến máu hiện có
-- Giả định: Những ai đã hiến máu >= 1 lần thì nhóm máu đã được xác thực
UPDATE nguoi_hien_mau 
SET nhom_mau_xac_nhan = TRUE,
    ngay_xac_nhan = lan_hien_gan_nhat,
    id_benh_vien_xac_nhan = 1,  -- ID bệnh viện mặc định
    ghi_chu_xac_nhan = 'Dữ liệu migration - Đã xác thực trước đây'
WHERE tong_so_lan_hien > 0 
  AND nhom_mau IS NOT NULL
  AND nhom_mau_xac_nhan = FALSE;
```

## Tài khoản Test

Từ `db.sql`:

1. **Người hiến máu đã xác thực**
   - Email: `nguyenvana@email.com`
   - Password: `123456`
   - Nhóm máu: O (đã xác thực)

2. **Người hiến máu chưa xác thực**
   - Email: `levanc@email.com`
   - Password: `123456`
   - Nhóm máu: B (chưa xác thực)

3. **Bệnh viện**
   - Email: `nguyenthif@email.com`
   - Password: `123456`

## Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.

