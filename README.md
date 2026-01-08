# Website Quản Lý Hiến Máu Tình Nguyện Đà Nẵng

Hệ thống quản lý hiến máu tình nguyện với đầy đủ tính năng cho các vai trò: Người hiến máu, Tổ chức, Bệnh viện, Nhóm tình nguyện và Quản trị viên.

## Công nghệ sử dụng

### Backend

- Node.js (v18+)
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- bcrypt
- express-validator
- Socket.io (Real-time notifications)
- Nodemailer (Email OTP)
- CORS

### Frontend

- React 19
- Vite
- React Router DOM v7
- Axios
- Socket.io-client (Real-time notifications)

### Database

- MySQL 8.0+

## Cấu trúc project

```
hienmautinhnguyen/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API routes
│   │   └── app.js           # Express app
│   ├── package.json
│   └── .env.example
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   └── App.jsx          # Main app
│   └── package.json
└── db.sql                   # Database schema
```

## Cài đặt

### 1. Database Setup

```bash
# Import database schema
mysql -u root -p < db.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn

# Khởi động MySQL (nếu chưa chạy)
sudo /usr/local/mysql/support-files/mysql.server start

npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## Cấu hình Environment Variables

### Backend (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_hien_mau
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Hệ thống hiến máu Đà Nẵng
```

**Lưu ý về Email:**

- Nếu dùng Gmail, cần bật 2-Step Verification và tạo App Password
- Truy cập: https://myaccount.google.com/apppasswords
- Sử dụng App Password thay vì mật khẩu Gmail thông thường

### Frontend (.env)

Tạo file `.env` trong thư mục frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Health Check

- `GET /api/health` - Kiểm tra trạng thái server

### Authentication

- `POST /api/auth/send-registration-otp` - Gửi OTP đăng ký
- `POST /api/auth/verify-registration-otp` - Xác thực OTP đăng ký
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `GET /api/auth/profile` - Lấy profile
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/verify-otp` - Xác thực OTP quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Donors (Người hiến máu)

- `GET /api/donors/profile` - Lấy profile
- `PUT /api/donors/profile` - Cập nhật profile
- `GET /api/donors/blood-info` - Lấy thông tin nhóm máu
- `PUT /api/donors/blood-info` - Cập nhật nhóm máu
- `GET /api/donors/history` - Lịch sử hiến máu

### Events (Sự kiện - Public)

- `GET /api/events` - Danh sách sự kiện công khai
- `GET /api/events/upcoming/list` - Danh sách sự kiện sắp diễn ra
- `GET /api/events/:id` - Chi tiết sự kiện

### Registrations (Đăng ký)

- `POST /api/registrations/event/:eventId` - Đăng ký sự kiện (Người hiến)
- `GET /api/registrations/my` - Lịch đăng ký của tôi (Người hiến)
- `DELETE /api/registrations/:registrationId` - Hủy đăng ký (Người hiến)
- `GET /api/registrations/event/:eventId/list` - Danh sách đăng ký (Tổ chức)
- `PUT /api/registrations/:registrationId/status` - Duyệt/từ chối đăng ký (Tổ chức)

### Locations (Địa điểm)

- `GET /api/locations` - Danh sách địa điểm
- `GET /api/locations/nearby` - Địa điểm gần nhất

### Organizations (Tổ chức)

- `GET /api/organizations/stats` - Thống kê tổ chức
- `GET /api/organizations/profile` - Lấy profile
- `PUT /api/organizations/profile` - Cập nhật profile
- `GET /api/organizations/hospitals` - Danh sách bệnh viện
- `GET /api/organizations/events` - Sự kiện của tổ chức
- `GET /api/organizations/events/:id` - Chi tiết sự kiện
- `POST /api/organizations/events` - Tạo sự kiện
- `PUT /api/organizations/events/:id` - Cập nhật sự kiện
- `DELETE /api/organizations/events/:id` - Xóa sự kiện
- `GET /api/organizations/events/:id/registrations` - Danh sách đăng ký

### Approvals (Duyệt - Tổ chức)

- `PUT /api/approvals/registrations/:id/approve` - Duyệt đăng ký
- `PUT /api/approvals/registrations/:id/reject` - Từ chối đăng ký
- `GET /api/approvals/registrations/pending` - Danh sách đăng ký chờ duyệt

### Hospitals (Bệnh viện)

- `GET /api/hospitals/stats` - Thống kê bệnh viện
- `PUT /api/hospitals/profile` - Cập nhật profile
- `GET /api/hospitals/events/pending` - Sự kiện chờ duyệt
- `GET /api/hospitals/events/approved` - Sự kiện đã duyệt
- `GET /api/hospitals/events/all` - Tất cả sự kiện
- `PUT /api/hospitals/events/:id/status` - Duyệt/từ chối sự kiện
- `GET /api/hospitals/events/:id/registrations` - Danh sách đăng ký đã duyệt
- `POST /api/hospitals/results` - Tạo kết quả hiến máu cho 1 người
- `POST /api/hospitals/results/bulk` - Tạo kết quả hàng loạt
- `POST /api/hospitals/notifications` - Gửi thông báo kêu gọi khẩn cấp
- `GET /api/hospitals/blood-types/unconfirmed` - Danh sách nhóm máu chưa xác thực
- `GET /api/hospitals/blood-types/all` - Danh sách tất cả nhóm máu
- `POST /api/hospitals/blood-types/confirm` - Xác thực nhóm máu

### Volunteers (Nhóm tình nguyện)

- `GET /api/volunteers/notifications` - Danh sách thông báo
- `PUT /api/volunteers/notifications/:id/read` - Đánh dấu đã đọc
- `GET /api/volunteers/profile` - Lấy profile
- `PUT /api/volunteers/profile` - Cập nhật profile

### Notifications (Thông báo)

- `GET /api/notifications` - Danh sách thông báo của user
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `GET /api/notifications/unread/count` - Số lượng thông báo chưa đọc

### Admin

- `GET /api/admin/profile` - Lấy profile
- `PUT /api/admin/profile` - Cập nhật profile
- `GET /api/admin/users` - Danh sách người dùng
- `PUT /api/admin/users/:id` - Cập nhật người dùng
- `PUT /api/admin/users/:id/status` - Thay đổi trạng thái
- `DELETE /api/admin/users/:id` - Xóa người dùng
- `GET /api/admin/events` - Danh sách sự kiện
- `GET /api/admin/registrations` - Danh sách đăng ký
- `GET /api/admin/reports/overview` - Báo cáo tổng quan
- `GET /api/admin/reports/blood-types` - Báo cáo theo nhóm máu
- `GET /api/admin/reports/organizations` - Báo cáo theo tổ chức
- `GET /api/admin/reports/hospitals` - Báo cáo theo bệnh viện
- `GET /api/admin/stats` - Thống kê tổng quan

## Tính năng theo vai trò

### 1. Người hiến máu (nguoi_hien)

- **Quản lý tài khoản**
  - Đăng ký tài khoản với xác thực OTP qua email
  - Đăng nhập và quên mật khẩu
  - Cập nhật hồ sơ cá nhân
  - Quản lý thông tin nhóm máu
- **Sự kiện hiến máu**
  - Xem danh sách sự kiện công khai
  - Tìm kiếm sự kiện sắp diễn ra
  - Xem chi tiết sự kiện
  - Đăng ký tham gia sự kiện
  - Hủy đăng ký
- **Lịch sử**

  - Xem danh sách đăng ký của tôi
  - Xem lịch sử hiến máu
  - Xem kết quả hiến máu

- **Địa điểm**
  - Tìm kiếm điểm hiến máu gần nhất

### 2. Người phụ trách tổ chức (to_chuc)

- **Quản lý profile**
  - Xem và cập nhật thông tin tổ chức
- **Quản lý sự kiện**
  - Tạo sự kiện hiến máu mới
  - Xem danh sách sự kiện của tổ chức
  - Cập nhật thông tin sự kiện
  - Xóa sự kiện (nếu chưa có đăng ký)
  - Xem chi tiết sự kiện
- **Quản lý đăng ký**
  - Xem danh sách người đăng ký tham gia
  - Duyệt đăng ký của người hiến máu
  - Từ chối đăng ký với lý do
  - Xem thống kê đăng ký
- **Thống kê**
  - Xem thống kê tổng quan (tổng sự kiện, đăng ký, người tham gia)

### 3. Người phụ trách bệnh viện (benh_vien)

- **Quản lý profile**
  - Xem và cập nhật thông tin bệnh viện
- **Phê duyệt sự kiện**
  - Xem danh sách sự kiện chờ duyệt
  - Xem danh sách sự kiện đã duyệt
  - Duyệt hoặc từ chối sự kiện từ tổ chức
- **Quản lý đăng ký**
  - Xem danh sách đăng ký đã được tổ chức phê duyệt
  - Lọc theo sự kiện
- **Xác thực nhóm máu**
  - Xem danh sách người hiến chưa xác thực nhóm máu
  - Xem danh sách tất cả người hiến
  - Xác thực nhóm máu cho người hiến
- **Cập nhật kết quả**
  - Cập nhật kết quả hiến máu cho từng người
  - Cập nhật hàng loạt kết quả
  - Nhập thông tin: lượng máu hiến, ghi chú
- **Thông báo khẩn cấp**
  - Tạo thông báo kêu gọi hiến máu khẩn cấp
  - Gửi đến nhóm tình nguyện qua Socket.io
  - Chọn nhóm máu cần kêu gọi
- **Thống kê**
  - Xem thống kê tổng quan bệnh viện

### 4. Nhóm tình nguyện (nhom_tinh_nguyen)

- **Quản lý profile**
  - Xem và cập nhật thông tin nhóm
- **Nhận thông báo**
  - Nhận thông báo kêu gọi hiến máu khẩn cấp real-time
  - Xem danh sách thông báo
  - Xem chi tiết thông báo (nhóm máu, mô tả, thời gian)
  - Đánh dấu đã đọc
- **Chia sẻ thông tin**
  - Xem thông tin để chia sẻ đến cộng đồng
  - Liên hệ và vận động hiến máu

### 5. Quản trị viên (admin)

- **Quản lý người dùng**
  - Xem danh sách tất cả người dùng
  - Tìm kiếm, lọc người dùng
  - Cập nhật thông tin người dùng
  - Thay đổi trạng thái (kích hoạt/vô hiệu hóa)
  - Xóa người dùng
- **Quản lý sự kiện**
  - Xem danh sách tất cả sự kiện
  - Theo dõi trạng thái sự kiện
- **Quản lý đăng ký**
  - Xem danh sách tất cả đăng ký
  - Theo dõi trạng thái đăng ký
- **Báo cáo & Thống kê**
  - Xem báo cáo tổng quan
  - Báo cáo theo nhóm máu
  - Báo cáo theo tổ chức
  - Báo cáo theo bệnh viện
  - Thống kê tổng thể hệ thống
- **Cài đặt hệ thống**
  - Cấu hình hệ thống

## Tài khoản mẫu

Sau khi import db.sql, bạn có thể đăng nhập với:

- **Admin**: admin@hienmau.com / 123456
- **Người hiến máu**: nguyenvana@email.com / 123456
- **Tổ chức**: phamthid@email.com / 123456
- **Bệnh viện**: nguyenthif@email.com / 123456
- **Nhóm tình nguyện**: lethih@email.com / 123456

## Scripts

### Backend

```bash
npm start      # Chạy production
npm run dev    # Chạy development với nodemon
```

### Frontend

```bash
npm run dev    # Chạy development server
npm run build  # Build production
npm run preview # Preview production build
```

## Real-time Features (Socket.io)

Hệ thống sử dụng Socket.io để cung cấp các tính năng real-time:

### Thông báo real-time

- Bệnh viện tạo thông báo kêu gọi hiến máu khẩn cấp
- Nhóm tình nguyện nhận thông báo ngay lập tức
- Cập nhật số lượng thông báo chưa đọc real-time

### Socket Events

- `notification:new` - Thông báo mới
- `notification:read` - Đánh dấu đã đọc
- `connect` - Kết nối thành công
- `disconnect` - Ngắt kết nối

### Cách hoạt động

1. Client kết nối đến Socket.io server khi đăng nhập
2. Server xác thực token và lưu thông tin user
3. Khi có thông báo mới, server emit event đến các nhóm tình nguyện
4. Client nhận event và hiển thị thông báo real-time

## Tính năng bảo mật

- **Authentication**: JWT token với thời hạn 7 ngày
- **Authorization**: Phân quyền theo vai trò (RBAC)
- **Password**: Mã hóa bằng bcrypt
- **OTP**: Xác thực email khi đăng ký và quên mật khẩu qua Nodemailer
- **CORS**: Cấu hình chặt chẽ cho frontend
- **SQL Injection**: Sử dụng prepared statements
- **XSS**: Validation input với express-validator

## Cấu trúc Database

Hệ thống sử dụng 15 bảng chính:

1. **vaitro** - Vai trò người dùng
2. **nguoidung** - Thông tin người dùng
3. **nguoi_hien_mau** - Thông tin người hiến máu
4. **to_chuc** - Thông tin tổ chức
5. **benh_vien** - Thông tin bệnh viện
6. **nguoi_phu_trach_to_chuc** - Người phụ trách tổ chức
7. **nguoi_phu_trach_benh_vien** - Người phụ trách bệnh viện
8. **nhom_tinh_nguyen** - Nhóm tình nguyện
9. **sukien** - Sự kiện hiến máu
10. **dangky** - Đăng ký tham gia sự kiện
11. **ketqua** - Kết quả hiến máu
12. **diadiem** - Địa điểm hiến máu
13. **thongbao** - Thông báo chung
14. **thongbaobenhvien** - Thông báo từ bệnh viện
15. **thongbao_nhom** - Liên kết thông báo với nhóm tình nguyện

## Quy trình nghiệp vụ chính

### 1. Quy trình đăng ký và tổ chức sự kiện hiến máu

```
Tổ chức tạo sự kiện
    ↓
Bệnh viện xem và duyệt sự kiện
    ↓
Sự kiện được công khai
    ↓
Người hiến máu xem và đăng ký
    ↓
Tổ chức duyệt đăng ký
    ↓
Bệnh viện xem danh sách đã duyệt
    ↓
Diễn ra sự kiện
    ↓
Bệnh viện cập nhật kết quả
    ↓
Người hiến xem lịch sử
```

### 2. Quy trình xác thực nhóm máu

```
Người hiến cập nhật nhóm máu
    ↓
Bệnh viện xem danh sách chưa xác thực
    ↓
Bệnh viện xác thực nhóm máu
    ↓
Nhóm máu được đánh dấu đã xác thực
```

### 3. Quy trình thông báo khẩn cấp

```
Bệnh viện tạo thông báo kêu gọi
    ↓
Socket.io gửi real-time đến nhóm tình nguyện
    ↓
Nhóm tình nguyện nhận thông báo
    ↓
Chia sẻ thông tin đến cộng đồng
```

## Hướng dẫn sử dụng

### Đăng ký tài khoản

1. Truy cập trang đăng ký
2. Nhập email → Nhận OTP
3. Xác thực OTP
4. Điền thông tin đầy đủ
5. Chọn vai trò phù hợp
6. Hoàn tất đăng ký

### Tạo sự kiện hiến máu (Tổ chức)

1. Đăng nhập với vai trò Tổ chức
2. Vào menu "Quản lý sự kiện"
3. Nhấn "Tạo sự kiện mới"
4. Điền thông tin: tên, mô tả, địa điểm, thời gian
5. Chọn bệnh viện phụ trách
6. Gửi đề xuất
7. Chờ bệnh viện phê duyệt

### Đăng ký hiến máu (Người hiến)

1. Đăng nhập với vai trò Người hiến máu
2. Xem danh sách sự kiện
3. Chọn sự kiện phù hợp
4. Nhấn "Đăng ký"
5. Điền thông tin sàng lọc
6. Chờ tổ chức duyệt

### Gửi thông báo khẩn cấp (Bệnh viện)

1. Đăng nhập với vai trò Bệnh viện
2. Vào menu "Tạo thông báo"
3. Chọn nhóm máu cần kêu gọi
4. Nhập mô tả tình huống
5. Gửi thông báo
6. Nhóm tình nguyện sẽ nhận ngay lập tức

## Troubleshooting

### Backend không kết nối được database

```bash
# Kiểm tra MySQL đang chạy
sudo /usr/local/mysql/support-files/mysql.server status

# Khởi động MySQL
sudo /usr/local/mysql/support-files/mysql.server start

# Kiểm tra thông tin kết nối trong .env
```

### Frontend không gọi được API

```bash
# Kiểm tra backend đang chạy
curl http://localhost:5000/api/health

# Kiểm tra VITE_API_URL trong .env
echo $VITE_API_URL
```

### Socket.io không hoạt động

```bash
# Kiểm tra WebSocket trong browser console
# Xem log: "🔌 WebSocket connected"

# Kiểm tra CORS settings trong backend
```

### Không nhận được OTP email

```bash
# Kiểm tra cấu hình email trong .env
# Kiểm tra App Password của Gmail
# Xem logs trong console backend
```

## Lưu ý

1. Đảm bảo MySQL đang chạy trước khi start backend
2. Cập nhật thông tin database trong file `.env`
3. Đổi JWT_SECRET trong production
4. Sử dụng HTTPS trong production
5. Cấu hình CORS phù hợp với domain của bạn
6. Cấu hình email SMTP cho Nodemailer (Gmail, Outlook, etc.)
7. Port mặc định: Backend (5000), Frontend (5173)
8. Import file `db.sql` trước khi chạy ứng dụng

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request.

## Liên hệ

- Email: admin@hienmau.com
- Website: http://localhost:5173

## License

ISC

