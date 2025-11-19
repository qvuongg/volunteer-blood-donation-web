import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    mat_khau: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    id_vai_tro: 1 // Default to nguoi_hien
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C16 2 8 10 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 10 16 2 16 2Z" />
            </svg>
          </div>
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">Tham gia cùng chúng tôi</p>
        </div>

      {error && (
          <div className="alert alert-danger">
          {error}
        </div>
      )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="grid grid-cols-2">
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
                placeholder="Nguyễn Văn A"
          />
        </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
                className="form-input"
                placeholder="email@example.com"
          />
        </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label htmlFor="mat_khau" className="form-label">Mật khẩu *</label>
          <input
            type="password"
            id="mat_khau"
            name="mat_khau"
            value={formData.mat_khau}
            onChange={handleChange}
            required
            minLength={6}
                className="form-input"
                placeholder="••••••••"
          />
              <p className="form-helper">Tối thiểu 6 ký tự</p>
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
          </div>

          <div className="grid grid-cols-2">
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
          </div>

          <div className="form-group">
            <label htmlFor="id_vai_tro" className="form-label">Vai trò *</label>
          <select
            id="id_vai_tro"
            name="id_vai_tro"
            value={formData.id_vai_tro}
            onChange={handleChange}
            required
              className="form-select"
          >
            <option value={1}>Người hiến máu</option>
            <option value={2}>Tổ chức</option>
            <option value={3}>Bệnh viện</option>
            <option value={4}>Nhóm tình nguyện</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
        >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
        </button>
      </form>

        <div className="auth-footer">
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
