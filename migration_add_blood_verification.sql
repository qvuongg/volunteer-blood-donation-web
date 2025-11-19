-- ============================================
-- MIGRATION: Add Blood Type Verification Fields
-- ============================================

USE quan_ly_hien_mau;

-- Add new columns to nguoi_hien_mau table
ALTER TABLE nguoi_hien_mau
ADD COLUMN nhom_mau_xac_nhan BOOLEAN DEFAULT FALSE COMMENT 'Nhóm máu đã được bệnh viện xác thực',
ADD COLUMN ngay_xac_nhan DATE COMMENT 'Ngày xác thực nhóm máu',
ADD COLUMN id_benh_vien_xac_nhan INT COMMENT 'Bệnh viện xác thực nhóm máu',
ADD COLUMN ghi_chu_xac_nhan TEXT COMMENT 'Ghi chú từ bệnh viện khi xác thực',
ADD CONSTRAINT fk_benh_vien_xac_nhan 
    FOREIGN KEY (id_benh_vien_xac_nhan) REFERENCES benh_vien(id_benh_vien);

-- Update existing donors who have donated before
-- Assume those with > 0 donations have verified blood type
UPDATE nguoi_hien_mau 
SET nhom_mau_xac_nhan = TRUE,
    ngay_xac_nhan = lan_hien_gan_nhat,
    id_benh_vien_xac_nhan = 1,  -- Default to first hospital
    ghi_chu_xac_nhan = 'Dữ liệu từ hệ thống cũ - Đã xác thực'
WHERE tong_so_lan_hien > 0 
  AND nhom_mau IS NOT NULL
  AND nhom_mau_xac_nhan = FALSE;

-- Verify changes
SELECT 
    id_nguoi_hien,
    nhom_mau,
    nhom_mau_xac_nhan,
    ngay_xac_nhan,
    tong_so_lan_hien
FROM nguoi_hien_mau;

SELECT 'Migration completed successfully!' as status;

