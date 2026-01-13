
// Update profile
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id_nguoi_dung;
        const { ho_ten, so_dien_thoai, gioi_tinh, ngay_sinh, nhom_mau, cccd } = req.body;

        // Check if phone is already used by another user
        if (so_dien_thoai) {
            const [existingPhones] = await pool.execute(
                'SELECT id_nguoi_dung FROM nguoidung WHERE so_dien_thoai = ? AND id_nguoi_dung != ?',
                [so_dien_thoai, userId]
            );

            if (existingPhones.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số điện thoại đã được sử dụng.'
                });
            }
        }

        // Check if CCCD is already used by another user
        if (cccd) {
            const [existingCCCD] = await pool.execute(
                'SELECT id_nguoi_dung FROM nguoidung WHERE cccd = ? AND id_nguoi_dung != ?',
                [cccd, userId]
            );

            if (existingCCCD.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Số CCCD/CMND đã được sử dụng.'
                });
            }
        }

        // Update user info
        const updateFields = [];
        const updateValues = [];

        if (ho_ten) {
            updateFields.push('ho_ten = ?');
            updateValues.push(ho_ten);
        }
        if (so_dien_thoai !== undefined) {
            updateFields.push('so_dien_thoai = ?');
            updateValues.push(so_dien_thoai || null);
        }
        if (gioi_tinh) {
            updateFields.push('gioi_tinh = ?');
            updateValues.push(gioi_tinh);
        }
        if (ngay_sinh) {
            updateFields.push('ngay_sinh = ?');
            updateValues.push(ngay_sinh);
        }
        if (cccd !== undefined) {
            updateFields.push('cccd = ?');
            updateValues.push(cccd || null);
        }

        if (updateFields.length > 0) {
            updateValues.push(userId);
            await pool.execute(
                `UPDATE nguoidung SET ${updateFields.join(', ')} WHERE id_nguoi_dung = ?`,
                updateValues
            );
        }

        // Update blood type if provided
        if (nhom_mau) {
            const validBloodTypes = ['A', 'B', 'AB', 'O'];
            if (validBloodTypes.includes(nhom_mau)) {
                // Check if verified
                const [donors] = await pool.execute(
                    'SELECT nhom_mau_xac_nhan FROM nguoi_hien_mau WHERE id_nguoi_hien = ?',
                    [userId]
                );

                // Only update if not verified
                if (donors.length > 0 && !donors[0].nhom_mau_xac_nhan) {
                    await pool.execute(
                        'UPDATE nguoi_hien_mau SET nhom_mau = ? WHERE id_nguoi_hien = ?',
                        [nhom_mau, userId]
                    );
                }
            }
        }

        // Get updated user and donor info
        const [users] = await pool.execute(
            `SELECT id_nguoi_dung, ho_ten, email, so_dien_thoai, gioi_tinh, ngay_sinh, id_vai_tro, trang_thai, cccd 
       FROM nguoidung WHERE id_nguoi_dung = ?`,
            [userId]
        );

        // Fetch updated donor info as well to return consistent data
        const [donors] = await pool.execute(
            `SELECT nh.id_nguoi_hien, nh.nhom_mau, nh.lan_hien_gan_nhat, nh.tong_so_lan_hien,
              nh.nhom_mau_xac_nhan, nh.ngay_xac_nhan, nh.id_nguoi_phu_trach_benh_vien, nh.ghi_chu_xac_nhan,
              bv.ten_benh_vien as ten_benh_vien_xac_nhan
       FROM nguoi_hien_mau nh
       LEFT JOIN nguoi_phu_trach_benh_vien nptbv ON nh.id_nguoi_phu_trach_benh_vien = nptbv.id_nguoi_phu_trach
       LEFT JOIN benh_vien bv ON nptbv.id_benh_vien = bv.id_benh_vien
       WHERE nh.id_nguoi_hien = ?`,
            [userId]
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công.',
            data: {
                user: users[0],
                donor: donors[0]
            }
        });
    } catch (error) {
        next(error);
    }
};
