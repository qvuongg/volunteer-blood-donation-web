import pool from '../config/database.js';

// Get organization id for user
const getOrganizationId = async (userId) => {
  const [orgs] = await pool.execute(
    'SELECT id_to_chuc FROM nguoi_phu_trach_to_chuc WHERE id_nguoi_dung = ?',
    [userId]
  );
  return orgs.length > 0 ? orgs[0].id_to_chuc : null;
};

// Get my organization coordinator id
const getCoordinatorId = async (userId) => {
  const [coords] = await pool.execute(
    'SELECT id_nguoi_phu_trach FROM nguoi_phu_trach_to_chuc WHERE id_nguoi_dung = ?',
    [userId]
  );
  return coords.length > 0 ? coords[0].id_nguoi_phu_trach : null;
};

// Approve registration
export const approveRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const { ghi_chu_duyet } = req.body;

    const coordinatorId = await getCoordinatorId(userId);

    if (!coordinatorId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người phụ trách.'
      });
    }

    // Check if registration exists and belongs to organization's event
    const [registrations] = await pool.execute(
      `SELECT dk.id_dang_ky, dk.id_su_kien, sk.id_to_chuc
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE dk.id_dang_ky = ?`,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đăng ký không tồn tại.'
      });
    }

    const orgId = await getOrganizationId(userId);
    if (registrations[0].id_to_chuc !== orgId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền duyệt đăng ký này.'
      });
    }

    // Update registration
    await pool.execute(
      `UPDATE dang_ky_hien_mau 
       SET trang_thai = 'da_duyet', id_nguoi_duyet = ?, ghi_chu_duyet = ?
       WHERE id_dang_ky = ?`,
      [coordinatorId, ghi_chu_duyet || null, id]
    );

    res.json({
      success: true,
      message: 'Duyệt đăng ký thành công.'
    });
  } catch (error) {
    next(error);
  }
};

// Reject registration
export const rejectRegistration = async (req, res, next) => {
  try {
    const userId = req.user.id_nguoi_dung;
    const { id } = req.params;
    const { ghi_chu_duyet } = req.body;

    const coordinatorId = await getCoordinatorId(userId);

    if (!coordinatorId) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin người phụ trách.'
      });
    }

    // Check if registration exists and belongs to organization's event
    const [registrations] = await pool.execute(
      `SELECT dk.id_dang_ky, dk.id_su_kien, sk.id_to_chuc
       FROM dang_ky_hien_mau dk
       JOIN sukien_hien_mau sk ON dk.id_su_kien = sk.id_su_kien
       WHERE dk.id_dang_ky = ?`,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đăng ký không tồn tại.'
      });
    }

    const orgId = await getOrganizationId(userId);
    if (registrations[0].id_to_chuc !== orgId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền từ chối đăng ký này.'
      });
    }

    // Update registration
    await pool.execute(
      `UPDATE dang_ky_hien_mau 
       SET trang_thai = 'tu_choi', id_nguoi_duyet = ?, ghi_chu_duyet = ?
       WHERE id_dang_ky = ?`,
      [coordinatorId, ghi_chu_duyet || null, id]
    );

    res.json({
      success: true,
      message: 'Từ chối đăng ký thành công.'
    });
  } catch (error) {
    next(error);
  }
};

