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

// Get all locations (from approved events)
export const getLocations = async (req, res, next) => {
  try {
    const [locations] = await pool.execute(
      `SELECT 
        DISTINCT
        sk.id_su_kien AS id_dia_diem,
        sk.ten_dia_diem,
        sk.dia_chi_dia_diem AS dia_chi
      FROM sukien_hien_mau sk
      WHERE sk.trang_thai = 'da_duyet'
        AND sk.ten_dia_diem IS NOT NULL
      ORDER BY sk.ten_dia_diem`
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

// Get nearby locations (approximate, based on text search - coordinates removed)
export const getNearbyLocations = async (req, res, next) => {
  try {
    const [locations] = await pool.execute(
      `SELECT 
        DISTINCT
        sk.id_su_kien AS id_dia_diem,
        sk.ten_dia_diem,
        sk.dia_chi_dia_diem AS dia_chi
      FROM sukien_hien_mau sk
      WHERE sk.trang_thai = 'da_duyet'
        AND sk.ten_dia_diem IS NOT NULL`
    );

    res.json({
      success: true,
      data: {
        locations,
        userLocation: null,
        radius: null
      }
    });
  } catch (error) {
    next(error);
  }
};

