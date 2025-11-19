import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Profile = () => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/donors/profile');
      if (response.data.success && response.data.data.user) {
        const user = response.data.data.user;
        setFormData({
          ho_ten: user.ho_ten || '',
          so_dien_thoai: user.so_dien_thoai || '',
          gioi_tinh: user.gioi_tinh || 'Nam',
          ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await api.put('/donors/profile', formData);
      if (response.data.success) {
        setMessage('success');
        setTimeout(() => {
          navigate('/donor/dashboard');
        }, 1500);
      }
    } catch (error) {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Cập nhật thông tin cá nhân</h1>
        <p className="page-description">
          Cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body">
          {message === 'success' && (
            <div className="alert alert-success">
              Cập nhật thành công! Đang chuyển hướng...
            </div>
          )}
          {message === 'error' && (
            <div className="alert alert-danger">
              Có lỗi xảy ra. Vui lòng thử lại.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="ho_ten" className="form-label">Họ tên *</label>
              <input
                type="text"
                id="ho_ten"
                name="ho_ten"
                value={formData.ho_ten}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="so_dien_thoai" className="form-label">Số điện thoại</label>
              <input
                type="tel"
                id="so_dien_thoai"
                name="so_dien_thoai"
                value={formData.so_dien_thoai}
                onChange={handleChange}
                className="form-input"
                placeholder="0901234567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gioi_tinh" className="form-label">Giới tính *</label>
              <select
                id="gioi_tinh"
                name="gioi_tinh"
                value={formData.gioi_tinh}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ngay_sinh" className="form-label">Ngày sinh *</label>
              <input
                type="date"
                id="ngay_sinh"
                name="ngay_sinh"
                value={formData.ngay_sinh}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="small" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="btn btn-outline"
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

export default Profile;
