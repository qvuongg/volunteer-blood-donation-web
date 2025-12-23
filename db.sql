-- ============================================
-- CSDL QUAN LY HIEN MAU TINH NGUYEN DA NANG
-- ============================================

-- Tạo database
DROP DATABASE IF EXISTS quan_ly_hien_mau;
CREATE DATABASE quan_ly_hien_mau CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quan_ly_hien_mau;

-- ============================================
-- 1. BẢNG VAI TRÒ
-- ============================================
CREATE TABLE vaitro (
    id_vai_tro INT PRIMARY KEY AUTO_INCREMENT,
    ten_vai_tro VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BẢNG NGƯỜI DÙNG
-- ============================================
CREATE TABLE nguoidung (
    id_nguoi_dung INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE,
    gioi_tinh ENUM('Nam', 'Nu', 'Khac') NOT NULL,
    ngay_sinh DATE NOT NULL,
    id_vai_tro INT NOT NULL,
    trang_thai BOOLEAN DEFAULT TRUE,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vai_tro) REFERENCES vaitro(id_vai_tro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. BẢNG TỔ CHỨC
-- ============================================
CREATE TABLE to_chuc (
    id_to_chuc INT PRIMARY KEY AUTO_INCREMENT,
    ten_don_vi VARCHAR(150) NOT NULL,
    dia_chi TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. BẢNG BỆNH VIỆN
-- ============================================
CREATE TABLE benh_vien (
    id_benh_vien INT PRIMARY KEY AUTO_INCREMENT,
    ten_benh_vien VARCHAR(150) NOT NULL,
    dia_chi TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. BẢNG NGƯỜI PHỤ TRÁCH TỔ CHỨC
-- ============================================
CREATE TABLE nguoi_phu_trach_to_chuc (
    id_nguoi_phu_trach INT PRIMARY KEY,
    id_to_chuc INT NOT NULL,
    nguoi_lien_he VARCHAR(100),
    FOREIGN KEY (id_nguoi_phu_trach) REFERENCES nguoidung(id_nguoi_dung),
    FOREIGN KEY (id_to_chuc) REFERENCES to_chuc(id_to_chuc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. BẢNG NGƯỜI PHỤ TRÁCH BỆNH VIỆN
-- ============================================
CREATE TABLE nguoi_phu_trach_benh_vien (
    id_nguoi_phu_trach INT PRIMARY KEY,
    id_benh_vien INT NOT NULL,
    chuc_vu VARCHAR(50),
    nguoi_lien_he VARCHAR(100),
    FOREIGN KEY (id_nguoi_phu_trach) REFERENCES nguoidung(id_nguoi_dung),
    FOREIGN KEY (id_benh_vien) REFERENCES benh_vien(id_benh_vien)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. BẢNG NGƯỜI HIẾN MÁU
-- ============================================
CREATE TABLE nguoi_hien_mau (
    id_nguoi_hien INT PRIMARY KEY,
    nhom_mau VARCHAR(5),
    lan_hien_gan_nhat DATE,
    tong_so_lan_hien INT DEFAULT 0,
    nhom_mau_xac_nhan BOOLEAN DEFAULT FALSE,
    ngay_xac_nhan DATE,
    id_nguoi_phu_trach_benh_vien INT,
    ghi_chu_xac_nhan TEXT,
    FOREIGN KEY (id_nguoi_hien) REFERENCES nguoidung(id_nguoi_dung),
    FOREIGN KEY (id_nguoi_phu_trach_benh_vien) REFERENCES nguoi_phu_trach_benh_vien(id_nguoi_phu_trach)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. BẢNG NHÓM TÌNH NGUYỆN
-- ============================================
CREATE TABLE nhom_tinh_nguyen (
    id_nhom INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_dung INT NOT NULL,
    ten_nhom VARCHAR(150) NOT NULL,
    dia_chi TEXT,
    nguoi_lien_he VARCHAR(100),
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoidung(id_nguoi_dung)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. BẢNG SỰ KIỆN HIẾN MÁU
-- ============================================
CREATE TABLE sukien_hien_mau (
    id_su_kien INT PRIMARY KEY AUTO_INCREMENT,
    id_to_chuc INT NOT NULL,
    id_benh_vien INT NOT NULL,
    ten_su_kien VARCHAR(200) NOT NULL,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    ten_dia_diem VARCHAR(200),
    dia_chi TEXT,
    so_luong_du_kien INT,
    trang_thai VARCHAR(50) DEFAULT 'cho_duyet',
    id_phe_duyet_boi INT,
    FOREIGN KEY (id_to_chuc) REFERENCES to_chuc(id_to_chuc),
    FOREIGN KEY (id_benh_vien) REFERENCES benh_vien(id_benh_vien),
    FOREIGN KEY (id_phe_duyet_boi) REFERENCES nguoi_phu_trach_benh_vien(id_nguoi_phu_trach)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. BẢNG ĐĂNG KÝ HIẾN MÁU
-- ============================================
CREATE TABLE dang_ky_hien_mau (
    id_dang_ky INT PRIMARY KEY AUTO_INCREMENT,
    id_su_kien INT NOT NULL,
    id_nguoi_hien INT NOT NULL,
    id_nguoi_duyet INT,
    ngay_dang_ky TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_hen_hien DATE,
    khung_gio VARCHAR(20),
    phieu_kham_sang_loc JSON,
    trang_thai VARCHAR(50) DEFAULT 'cho_duyet',
    ghi_chu_duyet TEXT,
    FOREIGN KEY (id_su_kien) REFERENCES sukien_hien_mau(id_su_kien),
    FOREIGN KEY (id_nguoi_hien) REFERENCES nguoi_hien_mau(id_nguoi_hien),
    FOREIGN KEY (id_nguoi_duyet) REFERENCES nguoi_phu_trach_to_chuc(id_nguoi_phu_trach),
    INDEX idx_ngay_hen_hien (ngay_hen_hien)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. BẢNG KẾT QUẢ HIẾN MÁU
-- ============================================
CREATE TABLE ket_qua_hien_mau (
    id_ket_qua INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_hien INT NOT NULL,
    id_su_kien INT NOT NULL,
    id_benh_vien INT NOT NULL,
    ngay_hien DATE,
    luong_ml INT,
    ket_qua VARCHAR(100),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_hien) REFERENCES nguoi_hien_mau(id_nguoi_hien),
    FOREIGN KEY (id_su_kien) REFERENCES sukien_hien_mau(id_su_kien),
    FOREIGN KEY (id_benh_vien) REFERENCES benh_vien(id_benh_vien)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. BẢNG THÔNG BÁO
-- ============================================
CREATE TABLE thong_bao (
    id_thong_bao INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_nhan INT NOT NULL COMMENT 'ID người nhận thông báo',
    loai_thong_bao VARCHAR(50) NOT NULL COMMENT 'Loại: dang_ky_duyet, su_kien_duyet, nhom_mau_xac_nhan, ket_qua_hien_mau',
    tieu_de VARCHAR(200) NOT NULL COMMENT 'Tiêu đề thông báo',
    noi_dung TEXT NOT NULL COMMENT 'Nội dung thông báo',
    link_lien_ket VARCHAR(255) COMMENT 'Link liên quan đến thông báo',
    da_doc BOOLEAN DEFAULT FALSE COMMENT 'Đã đọc hay chưa',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    FOREIGN KEY (id_nguoi_nhan) REFERENCES nguoidung(id_nguoi_dung) ON DELETE CASCADE,
    INDEX idx_nguoi_nhan (id_nguoi_nhan),
    INDEX idx_da_doc (da_doc),
    INDEX idx_ngay_tao (ngay_tao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Bảng quản lý thông báo cho người dùng';

-- ============================================
-- 14. BẢNG MÃ OTP
-- ============================================
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- Insert vai trò
INSERT INTO vaitro (ten_vai_tro) VALUES
('nguoi_hien'),
('to_chuc'),
('benh_vien'),
('nhom_tinh_nguyen'),
('admin');

-- Insert người dùng (mật khẩu: 123456 đã được hash bcrypt cho Node.js)
-- Hash được tạo bằng bcrypt với saltRounds = 10
INSERT INTO nguoidung (ho_ten, email, mat_khau, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro) VALUES
-- Admin
('Quan Tri Vien', 'locb00302@gmail.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0900000001', 'Nam', '1990-01-01', 5),
-- Người hiến máu
('Nguyen Van A', 'nguyenvana@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0901000001', 'Nam', '1995-05-15', 1),
('Tran Thi B', 'tranthib@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0901000002', 'Nu', '1998-08-20', 1),
('Le Van C', 'levanc@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0901000003', 'Nam', '1992-03-10', 1),
-- Người phụ trách tổ chức
('Pham Thi D', 'phamthid@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0902000001', 'Nu', '1988-11-25', 2),
('Hoang Van E', 'hoangvane@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0902000002', 'Nam', '1985-07-12', 2),
-- Người phụ trách bệnh viện
('Nguyen Thi F', 'nguyenthif@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0903000001', 'Nu', '1980-04-05', 3),
('Tran Van G', 'tranvang@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0903000002', 'Nam', '1982-09-18', 3),
-- Nhóm tình nguyện
('Le Thi H', 'lethih@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0904000001', 'Nu', '1995-12-30', 4),
('Pham Van I', 'phamvani@email.com', '$2b$10$wrP.9VlkgrUNPGf2xt15v.gIBmaapz2vLuUtiKOOpmM0qxZGGkz2u', '0904000002', 'Nam', '1993-06-22', 4);

-- Insert tổ chức
INSERT INTO to_chuc (ten_don_vi, dia_chi) VALUES
('Doan Thanh Nien TP Da Nang', '123 Le Duan, Hai Chau, Da Nang'),
('Hoi Chu Thap Do Da Nang', '456 Nguyen Van Linh, Da Nang'),
('Truong Dai Hoc Bach Khoa Da Nang', '54 Nguyen Luong Bang, Lien Chieu, Da Nang');

-- Insert bệnh viện
INSERT INTO benh_vien (ten_benh_vien, dia_chi) VALUES
('Benh Vien Da Khoa Da Nang', '124 Hai Phong, Thanh Khe, Da Nang'),
('Benh Vien Tim Mach Da Nang', '215 Hong Bang, Hai Chau, Da Nang'),
('Benh Vien Phu San - Nhi Da Nang', '402 Le Van Hien, Thanh Khe, Da Nang');

-- Insert người phụ trách tổ chức
-- id_nguoi_phu_trach là FK trực tiếp đến nguoidung(id_nguoi_dung)
INSERT INTO nguoi_phu_trach_to_chuc (id_nguoi_phu_trach, id_to_chuc, nguoi_lien_he) VALUES
(5, 1, 'Pham Thi D'),
(6, 2, 'Hoang Van E');

-- Insert người phụ trách bệnh viện (MUST be before nguoi_hien_mau due to FK)
-- id_nguoi_phu_trach là FK trực tiếp đến nguoidung(id_nguoi_dung)
INSERT INTO nguoi_phu_trach_benh_vien (id_nguoi_phu_trach, id_benh_vien, chuc_vu, nguoi_lien_he) VALUES
(7, 1, 'Truong Phong Y Te', 'Nguyen Thi F'),
(8, 2, 'Pho Giam Doc', 'Tran Van G');

-- Insert người hiến máu (AFTER nguoi_phu_trach_benh_vien due to FK constraint)
-- id_nguoi_hien là FK trực tiếp đến nguoidung(id_nguoi_dung)
-- id_nguoi_phu_trach_benh_vien tham chiếu đến id_nguoi_phu_trach trong bảng nguoi_phu_trach_benh_vien
-- User 2: Đã hiến 3 lần, nhóm máu đã được xác thực bởi User 7 (id_nguoi_phu_trach = 7)
-- User 3: Đã hiến 5 lần, nhóm máu đã được xác thực bởi User 7 (id_nguoi_phu_trach = 7)
-- User 4: Đã hiến 2 lần, nhưng nhóm máu chưa được xác thực chính thức (tự khai báo)
INSERT INTO nguoi_hien_mau (id_nguoi_hien, nhom_mau, lan_hien_gan_nhat, tong_so_lan_hien, nhom_mau_xac_nhan, ngay_xac_nhan, id_nguoi_phu_trach_benh_vien, ghi_chu_xac_nhan) VALUES
(2, 'O', '2024-01-15', 1, TRUE, '2024-01-15', 7, 'Xác thực nhóm máu qua xét nghiệm tại BV Đa Khoa Đà Nẵng'),
(3, 'A', '2024-02-20', 1, TRUE, '2024-01-10', 7, 'Xác thực nhóm máu qua xét nghiệm tại BV Đa Khoa Đà Nẵng'),
(4, 'B', '2023-12-10', 1, FALSE, NULL, NULL, NULL);

-- Insert nhóm tình nguyện
INSERT INTO nhom_tinh_nguyen (id_nguoi_dung, ten_nhom, dia_chi, nguoi_lien_he) VALUES
(9, 'Nhom Tinh Nguyen Hien Mau Xanh', '123 Bach Dang, Hai Chau, Da Nang', 'Le Thi H'),
(10, 'Nhom Tinh Nguyen Tre Da Nang', '456 Tran Phu, Hai Chau, Da Nang', 'Pham Van I');

-- Insert sự kiện hiến máu
-- id_phe_duyet_boi tham chiếu đến id_nguoi_phu_trach trong bảng nguoi_phu_trach_benh_vien
-- User 7 (id_nguoi_phu_trach = 7) phụ trách bệnh viện 1
INSERT INTO sukien_hien_mau (id_to_chuc, id_benh_vien, ten_su_kien, ngay_bat_dau, ngay_ket_thuc, ten_dia_diem, dia_chi, so_luong_du_kien, trang_thai, id_phe_duyet_boi) VALUES
-- Sự kiện đã diễn ra (dùng cho lịch sử, demo)
(1, 1, 'Hien Mau Tinh Nguyen Mua Xuan 2024', '2024-03-15', '2024-03-15', 'Benh Vien Da Khoa Da Nang', '124 Hai Phong, Thanh Khe, Da Nang', 100, 'da_duyet', 7),
(2, 2, 'Chuong Trinh Hien Mau Nhan Dao 2024', '2024-04-20', '2024-04-20', 'Truong Dai Hoc Bach Khoa', '54 Nguyen Luong Bang, Lien Chieu, Da Nang', 150, 'cho_duyet', NULL),
(3, 1, 'Ngay Hoi Hien Mau Tinh Nguyen 2024', '2024-05-01', '2024-05-01', 'Trung Tam Hoi Nghi Tien Sa', '1 Le Van Duyet, Ngu Hanh Son, Da Nang', 200, 'cho_duyet', NULL),
-- Các sự kiện đang mở cổng đăng ký (trang_thai = 'da_duyet' để backend cho phép đăng ký)
(1, 1, 'Chien Dich Hien Mau Mua He 2025', '2025-06-10', '2026-06-10', 'Nha Van Hoa Thieu Nhi Da Nang', '2-4 Le Duan, Hai Chau, Da Nang', 120, 'da_duyet', 7),
(2, 2, 'Ngay Hoi Hien Mau Sinh Vien 2025', '2025-09-05', '2025-09-05', 'Truong Dai Hoc Bach Khoa Da Nang', '54 Nguyen Luong Bang, Lien Chieu, Da Nang', 180, 'da_duyet', 8),
(3, 1, 'Chuong Trinh Giot Mau Hong 2025', '2025-11-20', '2025-11-20', 'Trung Tam Hoi Nghi Tien Sa', '1 Le Van Duyet, Ngu Hanh Son, Da Nang', 200, 'da_duyet', 7),
(1, 1, 'Chien Dich Hien Mau Mua Xuan 2025', '2025-02-10', '2026-06-10', 'Nha Van Hoa Thieu Nhi Da Nang', '2-4 Le Duan, Hai Chau, Da Nang', 120, 'da_duyet', 7);
-- Insert đăng ký hiến máu
-- id_nguoi_duyet tham chiếu đến id_nguoi_phu_trach trong bảng nguoi_phu_trach_to_chuc
-- User 5 (id_nguoi_phu_trach = 5) phụ trách tổ chức 1
-- id_nguoi_hien: 2 = User 2, 3 = User 3, 4 = User 4
INSERT INTO dang_ky_hien_mau (id_su_kien, id_nguoi_hien, id_nguoi_duyet, ngay_hen_hien, khung_gio, phieu_kham_sang_loc, trang_thai, ghi_chu_duyet) VALUES
(1, 2, 5, '2024-03-15', '08:00 - 10:00', 
 '{"q1":{"hien_mau_chua":"co"},"q2":{"mac_benh":"khong","benh_gi":null},"q3":{"benh_ly_truoc":"khong","benh_khac":null},"q4":{"items":["khong"],"vacxin":null},"q5":{"items":["khong"]},"q6":{"items":["khong"]},"q7":{"mac_benh":"khong","khac":null},"q8":{"dung_thuoc":"khong","khac":null}}',
 'da_duyet', 'Dang ky thanh cong. Du dieu kien suc khoe'),
(1, 3, 5, '2024-03-15', '10:00 - 12:00',
 '{"q1":{"hien_mau_chua":"co"},"q2":{"mac_benh":"khong","benh_gi":null},"q3":{"benh_ly_truoc":"khong","benh_khac":null},"q4":{"items":["tiem_vacxin"],"vacxin":"COVID-19"},"q5":{"items":["khong"]},"q6":{"items":["khong"]},"q7":{"mac_benh":"khong","khac":null},"q8":{"dung_thuoc":"khong","khac":null}}',
 'da_duyet', 'Dang ky thanh cong. Da tiem vaccine nhung qua 1 thang'),
(1, 4, 5, '2024-03-15', '13:00 - 15:00',
 '{"q1":{"hien_mau_chua":"khong"},"q2":{"mac_benh":"khong","benh_gi":null},"q3":{"benh_ly_truoc":"khong","benh_khac":null},"q4":{"items":["khong"],"vacxin":null},"q5":{"items":["khong"]},"q6":{"items":["khong"]},"q7":{"mac_benh":"khong","khac":null},"q8":{"dung_thuoc":"khong","khac":null}}',
 'da_duyet', 'Dang ky thanh cong. Nguoi hien mau lan dau'),
(1, 4, NULL, '2024-04-20', '08:00 - 10:00',
 '{"q1":{"hien_mau_chua":"co"},"q2":{"mac_benh":"khong","benh_gi":null},"q3":{"benh_ly_truoc":"khong","benh_khac":null},"q4":{"items":["khong"],"vacxin":null},"q5":{"items":["khong"]},"q6":{"items":["khong"]},"q7":{"mac_benh":"khong","khac":null},"q8":{"dung_thuoc":"khong","khac":null}}',
 'cho_duyet', NULL);

-- Insert kết quả hiến máu
-- id_nguoi_hien: 2 = User 2, 3 = User 3
INSERT INTO ket_qua_hien_mau (id_nguoi_hien, id_su_kien, id_benh_vien, ngay_hien, luong_ml, ket_qua) VALUES
(2, 1, 1, '2024-03-15', 450, 'Dat'), -- User 2 (id_nguoi_hien = 2)
(3, 1, 1, '2024-03-15', 450, 'Dat'); -- User 3 (id_nguoi_hien = 3)

-- Insert thông báo (sample notifications for testing)
INSERT INTO thong_bao (id_nguoi_nhan, loai_thong_bao, tieu_de, noi_dung, link_lien_ket, da_doc) VALUES
(2, 'dang_ky_duyet', 'Đăng ký hiến máu đã được duyệt', 'Đăng ký tham gia sự kiện "Ngay Hien Mau Mua Xuan" của bạn đã được phê duyệt. Vui lòng đến đúng giờ.', '/donor/events/1', FALSE),
(5, 'su_kien_duyet', 'Sự kiện đã được phê duyệt', 'Sự kiện hiến máu của bạn đã được bệnh viện phê duyệt. Bạn có thể bắt đầu tổ chức và quản lý đăng ký.', '/organization/events/1', FALSE);