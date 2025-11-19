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

### Frontend

- React 18
- Vite
- React Router
- Axios

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
2) Khởi động MySQL
# Cách 1: dùng script mysql.server
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
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quan_ly_hien_mau
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

### Frontend

Tạo file `.env` trong thư mục frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Donors (Người hiến máu)

- `GET /api/donors/profile` - Lấy profile
- `PUT /api/donors/profile` - Cập nhật profile
- `GET /api/donors/blood-info` - Lấy thông tin nhóm máu
- `PUT /api/donors/blood-info` - Cập nhật nhóm máu
- `GET /api/donors/history` - Lịch sử hiến máu

### Events (Sự kiện)

- `GET /api/events` - Danh sách sự kiện
- `GET /api/events/:id` - Chi tiết sự kiện

### Registrations (Đăng ký)

- `POST /api/registrations` - Đăng ký sự kiện
- `GET /api/registrations/my` - Lịch đăng ký của tôi

### Locations (Địa điểm)

- `GET /api/locations` - Danh sách địa điểm
- `GET /api/locations/nearby` - Địa điểm gần nhất

### Organizations (Tổ chức)

- `GET /api/organizations/events` - Sự kiện của tổ chức
- `POST /api/organizations/events` - Tạo sự kiện
- `PUT /api/organizations/events/:id` - Cập nhật sự kiện
- `DELETE /api/organizations/events/:id` - Xóa sự kiện
- `GET /api/organizations/events/:id/registrations` - Danh sách đăng ký

### Approvals (Duyệt)

- `PUT /api/approvals/registrations/:id/approve` - Duyệt đăng ký
- `PUT /api/approvals/registrations/:id/reject` - Từ chối đăng ký

### Hospitals (Bệnh viện)

- `GET /api/hospitals/events/pending` - Sự kiện chờ duyệt
- `PUT /api/hospitals/events/:id/status` - Duyệt/từ chối sự kiện
- `GET /api/hospitals/events/:id/registrations` - Danh sách đăng ký đã duyệt
- `POST /api/hospitals/results` - Tạo kết quả hiến máu
- `POST /api/hospitals/notifications` - Gửi thông báo

### Volunteers (Nhóm tình nguyện)

- `GET /api/volunteers/notifications` - Danh sách thông báo
- `PUT /api/volunteers/notifications/:id/read` - Đánh dấu đã đọc

### Admin

- `GET /api/admin/users` - Danh sách người dùng
- `PUT /api/admin/users/:id` - Cập nhật người dùng
- `PUT /api/admin/users/:id/status` - Thay đổi trạng thái
- `DELETE /api/admin/users/:id` - Xóa người dùng
- `GET /api/admin/stats` - Thống kê

## Tính năng theo vai trò

### 1. Người hiến máu

- Đăng ký tài khoản & cập nhật hồ sơ
- Đăng nhập
- Đăng ký lịch hiến máu
- Xem lịch sử hiến máu
- Tìm kiếm điểm hiến máu gần nhất

### 2. Người phụ trách tổ chức

- Đăng ký tổ chức chương trình hiến máu
- Duyệt người tham gia hiến máu
- Báo cáo kết quả cho bệnh viện

### 3. Người phụ trách bệnh viện

- Duyệt đề xuất tổ chức hiến máu
- Duyệt danh sách từ tổ chức
- Cập nhật kết quả hiến máu
- Gửi thông báo đến nhóm tình nguyện

### 4. Nhóm tình nguyện

- Nhận thông báo kêu gọi máu khẩn cấp
- Chia sẻ thông tin kêu gọi
- Liên hệ và vận động hiến máu

### 5. Quản trị viên

- Quản lý tài khoản
- Xem thống kê tổng quan

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

## Lưu ý

1. Đảm bảo MySQL đang chạy trước khi start backend
2. Cập nhật thông tin database trong file `.env`
3. Đổi JWT_SECRET trong production
4. Sử dụng HTTPS trong production
5. Cấu hình CORS phù hợp với domain của bạn

## License

ISC
