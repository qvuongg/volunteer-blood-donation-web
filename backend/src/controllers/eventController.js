import pool from '../config/database.js';

// Get all events (public, for donors)
export const getEvents = async (req, res, next) => {
  try {
    const { status, search, dateFrom, dateTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        tc.ten_don_vi,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
    `;

    const params = [];
    const whereConditions = [];
    
    // Always filter by approved status
    whereConditions.push('sk.trang_thai = "da_duyet"');

    // Filter by event status (dang_dien_ra, sap_dien_ra, da_ket_thuc)
    if (status) {
      const today = new Date().toISOString().split('T')[0];
      if (status === 'dang_dien_ra') {
        whereConditions.push('sk.ngay_bat_dau <= ? AND sk.ngay_ket_thuc >= ?');
        params.push(today, today);
      } else if (status === 'sap_dien_ra') {
        whereConditions.push('sk.ngay_bat_dau > ?');
        params.push(today);
      } else if (status === 'da_ket_thuc') {
        whereConditions.push('sk.ngay_ket_thuc < ?');
        params.push(today);
      }
    }

    // Filter by date range
    if (dateFrom) {
      whereConditions.push('sk.ngay_ket_thuc >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      whereConditions.push('sk.ngay_bat_dau <= ?');
      params.push(dateTo);
    }

    // Search filter
    if (search) {
      whereConditions.push('(sk.ten_su_kien LIKE ? OR sk.dia_chi LIKE ? OR sk.ten_dia_diem LIKE ? OR tc.ten_don_vi LIKE ? OR bv.ten_benh_vien LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Get paginated events
    query += whereClause;
    query += ` ORDER BY sk.ngay_bat_dau DESC LIMIT ${limit} OFFSET ${offset}`;

    const [events] = await pool.execute(query, params);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming events (for dashboard)
export const getUpcomingEvents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const query = `
      SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        tc.ten_don_vi,
        bv.ten_benh_vien,
        sk.ten_dia_diem,
        sk.dia_chi,
        (SELECT COUNT(*) FROM dang_ky_hien_mau WHERE id_su_kien = sk.id_su_kien AND trang_thai = 'da_duyet') as so_luong_dang_ky
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.trang_thai = 'da_duyet'
        AND sk.ngay_ket_thuc >= CURDATE()
      ORDER BY sk.ngay_bat_dau ASC
      LIMIT ${limit}
    `;

    const [events] = await pool.execute(query);

    res.json({
      success: true,
      data: {
        events
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get event by ID
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [events] = await pool.execute(
      `SELECT 
        sk.id_su_kien,
        sk.ten_su_kien,
        sk.ngay_bat_dau,
        sk.ngay_ket_thuc,
        sk.so_luong_du_kien,
        sk.trang_thai,
        tc.id_to_chuc,
        tc.ten_don_vi,
        tc.dia_chi as to_chuc_dia_chi,
        bv.id_benh_vien,
        bv.ten_benh_vien,
        bv.dia_chi as benh_vien_dia_chi,
        sk.ten_dia_diem,
        sk.dia_chi
      FROM sukien_hien_mau sk
      JOIN to_chuc tc ON sk.id_to_chuc = tc.id_to_chuc
      JOIN benh_vien bv ON sk.id_benh_vien = bv.id_benh_vien
      WHERE sk.id_su_kien = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sự kiện không tồn tại.'
      });
    }

    // Get registration count
    const [regCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM dang_ky_hien_mau WHERE id_su_kien = ? AND trang_thai = "da_duyet"',
      [id]
    );

    res.json({
      success: true,
      data: {
        event: {
          ...events[0],
          so_luong_dang_ky: regCount[0].count
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

