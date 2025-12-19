import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    ten_su_kien: '',
    id_benh_vien: '',
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
    ten_dia_diem: '',
    dia_chi: '',
    so_luong_du_kien: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchHospitals();
    if (isEdit) {
      fetchEvent();
    }
  }, [id]);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/organizations/hospitals');
      if (response.data.success) {
        setHospitals(response.data.data.hospitals || []);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      alert('Lỗi khi tải danh sách bệnh viện: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingHospitals(false);
    }
  };

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/organizations/events/${id}`);
      if (response.data.success) {
        const event = response.data.data.event;
        setFormData({
          ten_su_kien: event.ten_su_kien || '',
          id_benh_vien: event.id_benh_vien || '',
          ngay_bat_dau: event.ngay_bat_dau ? new Date(event.ngay_bat_dau).toISOString().split('T')[0] : '',
          ngay_ket_thuc: event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc).toISOString().split('T')[0] : '',
          ten_dia_diem: event.ten_dia_diem || '',
          dia_chi: event.dia_chi || '',
          so_luong_du_kien: event.so_luong_du_kien || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải thông tin sự kiện: ' + (error.response?.data?.message || error.message));
      navigate('/organization/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.ten_su_kien.trim()) {
      newErrors.ten_su_kien = 'Vui lòng nhập tên sự kiện';
    }

    if (!formData.id_benh_vien) {
      newErrors.id_benh_vien = 'Vui lòng chọn bệnh viện';
    }

    if (!formData.ngay_bat_dau) {
      newErrors.ngay_bat_dau = 'Vui lòng chọn ngày bắt đầu';
    }

    if (formData.ngay_ket_thuc && formData.ngay_ket_thuc < formData.ngay_bat_dau) {
      newErrors.ngay_ket_thuc = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.ten_dia_diem.trim()) {
      newErrors.ten_dia_diem = 'Vui lòng nhập tên địa điểm';
    }

    if (!formData.dia_chi.trim()) {
      newErrors.dia_chi = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        so_luong_du_kien: formData.so_luong_du_kien ? parseInt(formData.so_luong_du_kien) : null,
        ngay_ket_thuc: formData.ngay_ket_thuc || null
      };

      if (isEdit) {
        await api.put(`/organizations/events/${id}`, payload);
        alert('Cập nhật sự kiện thành công!');
        // Kiểm tra xem sự kiện có phải chưa được duyệt không
        const eventResponse = await api.get(`/organizations/events/${id}`);
        if (eventResponse.data.success && eventResponse.data.data.event.trang_thai === 'cho_duyet') {
          // Nếu chưa được duyệt, chuyển đến trang chi tiết
          navigate(`/organization/events/${id}`);
        } else {
          // Nếu đã được duyệt hoặc bị từ chối, quay về danh sách
          navigate('/organization/events');
        }
      } else {
        await api.post('/organizations/events', payload);
        alert('Tạo sự kiện thành công! Đang chờ bệnh viện duyệt.');
        navigate('/organization/events');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loadingHospitals) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">
          {isEdit ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
        </h1>
        <p className="page-description">
          {isEdit ? 'Cập nhật thông tin sự kiện hiến máu' : 'Tạo sự kiện hiến máu mới để gửi bệnh viện duyệt'}
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Tên sự kiện <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <input
                type="text"
                name="ten_su_kien"
                className={`form-input ${errors.ten_su_kien ? 'error' : ''}`}
                value={formData.ten_su_kien}
                onChange={handleChange}
                placeholder="Ví dụ: Hiến máu tình nguyện tại Đà Nẵng"
              />
              {errors.ten_su_kien && (
                <span className="form-error">{errors.ten_su_kien}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Bệnh viện <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <select
                name="id_benh_vien"
                className={`form-input ${errors.id_benh_vien ? 'error' : ''}`}
                value={formData.id_benh_vien}
                onChange={handleChange}
                disabled={isEdit}
              >
                <option value="">-- Chọn bệnh viện --</option>
                {hospitals.map(hospital => (
                  <option key={hospital.id_benh_vien} value={hospital.id_benh_vien}>
                    {hospital.ten_benh_vien}
                  </option>
                ))}
              </select>
              {errors.id_benh_vien && (
                <span className="form-error">{errors.id_benh_vien}</span>
              )}
              {hospitals.length === 0 && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Không có bệnh viện nào. Vui lòng liên hệ quản trị viên.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-md)' }}>
              <div className="form-group">
                <label className="form-label">
                  Ngày bắt đầu <span style={{ color: 'var(--danger-600)' }}>*</span>
                </label>
                <input
                  type="date"
                  name="ngay_bat_dau"
                  className={`form-input ${errors.ngay_bat_dau ? 'error' : ''}`}
                  value={formData.ngay_bat_dau}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.ngay_bat_dau && (
                  <span className="form-error">{errors.ngay_bat_dau}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ngày kết thúc</label>
                <input
                  type="date"
                  name="ngay_ket_thuc"
                  className={`form-input ${errors.ngay_ket_thuc ? 'error' : ''}`}
                  value={formData.ngay_ket_thuc}
                  onChange={handleChange}
                  min={formData.ngay_bat_dau || new Date().toISOString().split('T')[0]}
                />
                {errors.ngay_ket_thuc && (
                  <span className="form-error">{errors.ngay_ket_thuc}</span>
                )}
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Để trống nếu sự kiện chỉ diễn ra trong 1 ngày
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tên địa điểm <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <input
                type="text"
                name="ten_dia_diem"
                className={`form-input ${errors.ten_dia_diem ? 'error' : ''}`}
                value={formData.ten_dia_diem}
                onChange={handleChange}
                placeholder="Ví dụ: Hội trường A, Trung tâm văn hóa..."
              />
              {errors.ten_dia_diem && (
                <span className="form-error">{errors.ten_dia_diem}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Địa chỉ <span style={{ color: 'var(--danger-600)' }}>*</span>
              </label>
              <textarea
                name="dia_chi"
                className={`form-input ${errors.dia_chi ? 'error' : ''}`}
                value={formData.dia_chi}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập địa chỉ chi tiết..."
              />
              {errors.dia_chi && (
                <span className="form-error">{errors.dia_chi}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Số lượng dự kiến</label>
              <input
                type="number"
                name="so_luong_du_kien"
                className="form-input"
                value={formData.so_luong_du_kien}
                onChange={handleChange}
                min="1"
                placeholder="Số lượng người dự kiến tham gia"
              />
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                Để trống nếu chưa xác định
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo sự kiện')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/organization/events')}
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EventForm;

