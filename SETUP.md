# Hướng dẫn Setup và Fix CORS

## Đã fix

✅ **Express đã được hạ xuống version 4.18.2**  
✅ **CORS đã được config đầy đủ với Express 4**  
✅ **Frontend .env.local đã được tạo với full API URL**

## Các bước chạy project

### 1. Database

```bash
mysql -u root -p
# Enter password: root
```

```sql
SOURCE /Users/buiquocvuong/Projects/DATN/hienmautinhnguyen/db.sql;
```

### 2. Backend

```bash
cd backend

# Đã có .env với password: root
# Nếu cần, edit file .env

npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# File .env.local đã được tạo với:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Fix CORS đã thực hiện

### Backend (app.js)

```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:5000/api
```

**Lưu ý:** Sử dụng FULL URL (có `http://localhost:5000`) thay vì relative URL (`/api`)

## Test

1. Mở `http://localhost:5173`
2. Click "Đăng ký"
3. Điền form và submit
4. Nếu thành công → CORS đã fix ✅

## Troubleshooting

### Nếu vẫn gặp lỗi CORS:

1. **Restart cả backend và frontend:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Clear browser cache:**
   - Mở DevTools (F12)
   - Right click Refresh button → "Empty Cache and Hard Reload"

3. **Kiểm tra .env files:**
   - Backend: `.env` có `FRONTEND_URL=http://localhost:5173`
   - Frontend: `.env.local` có `VITE_API_URL=http://localhost:5000/api`

4. **Check console logs:**
   - Backend console: Xem requests đang đến
   - Frontend DevTools: Xem error messages

## Tài khoản test

Sau khi import database:

- **Admin**: admin@hienmau.com / 123456
- **Người hiến máu**: nguyenvana@email.com / 123456
- **Tổ chức**: phamthid@email.com / 123456
- **Bệnh viện**: nguyenthif@email.com / 123456
- **Nhóm tình nguyện**: lethih@email.com / 123456

## Kiểm tra API hoạt động

```bash
curl http://localhost:5000/api/health
```

Kết quả mong đợi:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```




