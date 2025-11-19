-- Test query để kiểm tra danh sách người cần xác thực nhóm máu
-- Dành cho Bệnh viện Đa Khoa Đà Nẵng (id = 1)

USE quan_ly_hien_mau;

-- 1. Kiểm tra dữ liệu người hiến máu
SELECT 
    nh.id_nguoi_hien,
    nd.ho_ten,
    nd.email,
    nh.nhom_mau,
    nh.nhom_mau_xac_nhan,
    nh.tong_so_lan_hien
FROM nguoi_hien_mau nh
JOIN nguoidung nd ON nh.id_nguoi_dung = nd.id_nguoi_dung
ORDER BY nh.id_nguoi_hien;

-- 2. Kiểm tra đăng ký của user 4 (Le Van C, id_nguoi_hien = 3)
SELECT 
    dk.id_dang_ky,
    sk.ten_su_kien,
    sk.id_benh_vien,
    bv.ten_benh_vien,
    dk.trang_thai,
    nh.nhom_mau,
    nh.nhom_mau_xac_nhan
FROM dang_ky_hien_mau dk
JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
JOIN nguoi_hien_mau nh ON dk.id_nguoi_hien = nh.id_nguoi_hien
WHERE dk.id_nguoi_hien = 3;

-- 3. Query chính - Lấy danh sách cần xác thực cho Bệnh viện 1
SELECT DISTINCT
    nh.id_nguoi_hien,
    nh.nhom_mau,
    nh.tong_so_lan_hien,
    nd.ho_ten,
    nd.email,
    nd.so_dien_thoai,
    nh.lan_hien_gan_nhat as ngay_hien_gan_nhat
FROM nguoi_hien_mau nh
JOIN nguoidung nd ON nh.id_nguoi_dung = nd.id_nguoi_dung
JOIN dang_ky_hien_mau dk ON nh.id_nguoi_hien = dk.id_nguoi_hien
JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
WHERE nh.nhom_mau_xac_nhan = FALSE 
  AND nh.nhom_mau IS NOT NULL
  AND sk.id_benh_vien = 1  -- Bệnh viện Đa Khoa Đà Nẵng
  AND dk.trang_thai = 'da_duyet'
GROUP BY nh.id_nguoi_hien, nh.nhom_mau, nh.tong_so_lan_hien, nd.ho_ten, nd.email, nd.so_dien_thoai, nh.lan_hien_gan_nhat
ORDER BY nh.lan_hien_gan_nhat DESC;

-- Kỳ vọng: Sẽ thấy Le Van C (email: levanc@email.com) trong danh sách
-- vì: nhom_mau = 'B', nhom_mau_xac_nhan = FALSE, đã đăng ký sự kiện 1 và được duyệt

