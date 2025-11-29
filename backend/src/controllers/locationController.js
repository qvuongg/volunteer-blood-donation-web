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

// Get all locations
export const getLocations = async (req, res, next) => {
  try {
    const [locations] = await pool.execute(
      `SELECT 
        id_dia_diem,
        ten_dia_diem,
        dia_chi,
        vi_do,
        kinh_do
      FROM dia_diem
      ORDER BY ten_dia_diem`
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

// Get nearby locations
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

    // Get all locations
    const [locations] = await pool.execute(
      `SELECT 
        id_dia_diem,
        ten_dia_diem,
        dia_chi,
        vi_do,
        kinh_do
      FROM dia_diem
      WHERE vi_do IS NOT NULL AND kinh_do IS NOT NULL`
    );

    // Calculate distances and filter
    const nearbyLocations = locations
      .map(location => {
        const distance = calculateDistance(
          userLat,
          userLng,
          parseFloat(location.vi_do),
          parseFloat(location.kinh_do)
        );
        return {
          ...location,
          distance: Math.round(distance * 10) / 10 // Round to 1 decimal
        };
      })
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

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

