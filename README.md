# Website Quản Lý Hiến Máu Tình Nguyện Đà Nẵng

Hệ thống quản lý hiến máu tình nguyện với đầy đủ tính năng cho các vai trò: Người hiến máu, Tổ chức, Bệnh viện, Nhóm tình nguyện và Quản trị viên.

## Công nghệ sử dụng

### Backend

- Node.js (v18+)
- Express.js
- MySQL2 (Database Driver)
- JWT (Authentication)
- bcrypt (Password Hashing)
- express-validator (Input Validation)
- Socket.io (Real-time notifications)
- Nodemailer (Email OTP)
- QRCode (Generation)

### Frontend

- React 19
- Vite
- React Router DOM v7
- Axios
- Socket.io-client
- React Calendar
- Recharts (Charts & Stats)
- Qrcode.react

### Database

- MySQL 8.0+

## Cấu trúc project

```
hienmautinhnguyen/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── config/         # Database & Socket config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation, error handler
│   │   ├── routes/          # API routes
│   │   └── app.js           # Express app setup
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

## API Endpoints Verified

### Auth (`/api/auth`)
- `POST /register` - Đăng ký tài khoản
- `POST /login` - Đăng nhập
- `GET /me` - Lấy thông tin user hiện tại
- `GET /profile` - Lấy profile chi tiết
- `POST /send-registration-otp` - Gửi OTP đăng ký
- `POST /verify-registration-otp` - Xác thực OTP đăng ký
- `POST /forgot-password` - Yêu cầu quên mật khẩu
- `POST /verify-otp` - Xác thực OTP reset pass
- `POST /reset-password` - Đặt lại mật khẩu mới

### Donors (`/api/donors`)
- `GET /profile` - Xem hồ sơ cá nhân
- `PUT /profile` - Cập nhật hồ sơ
- `POST /change-password` - Đổi mật khẩu
- `GET /blood-info` - Xem thông tin nhóm máu & chứng nhận
- `PUT /blood-info` - Cập nhật thông tin sức khỏe
- `GET /history` - Xem lịch sử hiến máu

### Events (`/api/events`) - Public
- `GET /` - Danh sách sự kiện (có filter search, dates)
- `GET /upcoming/list` - Danh sách sự kiện sắp tới
- `GET /:id` - Chi tiết sự kiện

### Registrations (`/api/registrations`)
- `POST /event/:eventId` - Đăng ký tham gia (Role: NguoiHien)
- `GET /my` - Danh sách đã đăng ký của tôi (Role: NguoiHien)
- `DELETE /:registrationId` - Hủy đăng ký (Role: NguoiHien)
- `GET /event/:eventId/list` - Danh sách người đăng ký (Role: ToChuc)
- `PUT /:registrationId/status` - Cập nhật trạng thái đăng ký (Role: ToChuc)

### Approvals (`/api/approvals`) - Role: ToChuc
- `GET /pending` - Danh sách đăng ký chờ duyệt
- `PUT /registrations/:id/approve` - Duyệt đăng ký
- `PUT /registrations/:id/reject` - Từ chối đăng ký

### Organizations (`/api/organizations`) - Role: ToChuc
- `GET /stats` - Thống kê của tổ chức
- `GET /profile` - Xem profile tổ chức
- `PUT /profile` - Cập nhật profile
- `POST /change-password` - Đổi mật khẩu
- `GET /hospitals` - Lấy danh sách bệnh viện (để tạo event)
- `GET /events` - Danh sách sự kiện của mình
- `POST /events` - Tạo sự kiện mới
- `GET /events/:id` - Chi tiết sự kiện
- `PUT /events/:id` - Sửa sự kiện
- `DELETE /events/:id` - Xóa sự kiện (nếu chưa diễn ra)
- `GET /events/:id/registrations` - Xem đăng ký của sự kiện

### Hospitals (`/api/hospitals`) - Role: BenhVien
- `GET /stats` - Thống kê bệnh viện
- `GET /events/pending` - Sự kiện chờ duyệt từ tổ chức
- `GET /events/approved` - Sự kiện đã duyệt
- `GET /events/all` - Tất cả sự kiện
- `PUT /events/:id/status` - Duyệt/Từ chối sự kiện
- `GET /events/:id/registrations` - DS đăng ký của sự kiện (để nhập KQ)
- `POST /results` - Nhập kết quả hiến máu
- `POST /results/bulk` - Nhập kết quả hàng loạt
- `POST /notifications` - Tạo thông báo khẩn cấp (Socket.io)
- `GET /blood-types/unconfirmed` - DS nhóm máu chưa xác thực
- `GET /blood-types/all` - Tra cứu nhóm máu tất cả users
- `POST /blood-types/confirm` - Xác thực nhóm máu
- `PUT /profile` - Cập nhật thông tin BV

### Volunteers (`/api/volunteers`) - Role: NhomTinhNguyen
- `GET /notifications` - Xem thông báo khẩn cấp
- `PUT /notifications/:id/read` - Đánh dấu đã đọc
- `GET /profile` - Xem profile
- `PUT /profile` - Cập nhật profile

### Admin (`/api/admin`) - Role: Admin
- `GET /stats` - Thống kê hệ thống
- `GET /activities/recent` - Hoạt động gần đây (Real-time logs)
- `GET /users` - Quản lý người dùng
- `GET /users/:id` - Chi tiết người dùng
- `PUT /users/:id` - Sửa người dùng
- `PUT /users/:id/status` - Khóa/Mở khóa tài khoản
- `GET /reports/overview` - Báo cáo tổng quan

### Notifications (`/api/notifications`) - General
- `GET /` - Lấy thông báo cá nhân
- `PUT /read-all` - Đánh dấu đã đọc tất cả

### Locations (`/api/locations`)
- `GET /` - Danh sách địa điểm hiến máu
- `GET /nearby` - Tìm địa điểm gần nhất

## Real-time Features

Hệ thống sử dụng **Socket.io** để:
1.  Gửi thông báo khẩn cấp từ Bệnh viện tới Nhóm tình nguyện (`urgent_request`)
2.  Thông báo trạng thái duyệt sự kiện/đăng ký

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng tạo issue hoặc pull request.
