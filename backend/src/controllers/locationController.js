import pool from '../config/database.js';

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Get all locations (derived from approved blood donation events)
export const getLocations = async (req, res, next) => {
  try {
    // Vì không có bảng dia_diem, ta sử dụng các sự kiện hiến máu đã được duyệt
    // như các "địa điểm hiến máu" đang mở cho người dùng đăng ký.
    const [locations] = await pool.execute(
      `SELECT 
        sk.id_su_kien        AS id_dia_diem,
        sk.ten_dia_diem      AS ten_dia_diem,
        sk.dia_chi           AS dia_chi,
        NULL                 AS vi_do,
        NULL                 AS kinh_do
      FROM sukien_hien_mau sk
      WHERE sk.trang_thai = 'da_duyet'
      ORDER BY sk.ngay_bat_dau DESC`
    );

    res.json({
      success: true,
      data: {
        locations
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby locations (hiện tại chưa có toạ độ trong DB, trả về danh sách rỗng hoặc toàn bộ đã duyệt)
export const getNearbyLocations = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10 } = req.query; // radius in km, default 10km

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp tọa độ (lat, lng).'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Hiện DB chưa lưu vi_do / kinh_do cho sự kiện, nên tạm thời trả về danh sách sự kiện đã duyệt,
    // không tính khoảng cách. Nếu sau này bổ sung toạ độ cho sự kiện, có thể áp dụng lại Haversine.
    const [locations] = await pool.execute(
      `SELECT 
        sk.id_su_kien        AS id_dia_diem,
        sk.ten_dia_diem      AS ten_dia_diem,
        sk.dia_chi           AS dia_chi,
        NULL                 AS vi_do,
        NULL                 AS kinh_do
      FROM sukien_hien_mau sk
      WHERE sk.trang_thai = 'da_duyet'
      ORDER BY sk.ngay_bat_dau DESC`
    );

    const nearbyLocations = locations;

    res.json({
      success: true,
      data: {
        locations: nearbyLocations,
        userLocation: { lat: userLat, lng: userLng },
        radius: radiusKm
      }
    });
  } catch (error) {
    next(error);
  }
};

