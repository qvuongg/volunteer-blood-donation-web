import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Complete
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    mat_khau: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    id_vai_tro: 1 // Default to nguoi_hien
  });
  const [otp, setOtp] = useState('');
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

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-registration-otp', {
        email: formData.email
      });
      
      if (response.data.success) {
        setStep(2);
        alert('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-registration-otp', {
        email: formData.email,
        otp
      });
      
      if (response.data.success) {
        // OTP verified, now create account
        await handleRegister();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
      setLoading(false);
    }
  };

  // Step 3: Create account
  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        setStep(3);
        setTimeout(() => {
          navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-registration-otp', {
        email: formData.email
      });
      alert('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 3) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>✅</div>
            <h2 style={{ color: 'var(--success-600)', marginBottom: 'var(--spacing-md)' }}>Đăng ký thành công!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Đang chuyển đến trang đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="auth-subtitle">
            {step === 1 && 'Điền thông tin để tạo tài khoản'}
            {step === 2 && 'Xác thực email của bạn'}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ 
            width: '40px', 
            height: '4px', 
            background: step >= 1 ? 'var(--primary-600)' : 'var(--gray-300)', 
            borderRadius: 'var(--radius-full)' 
          }} />
          <div style={{ 
            width: '40px', 
            height: '4px', 
            background: step >= 2 ? 'var(--primary-600)' : 'var(--gray-300)', 
            borderRadius: 'var(--radius-full)' 
          }} />
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
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
                  minLength="6"
                  className="form-input"
                  placeholder="Tối thiểu 6 ký tự"
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
                  placeholder="0123456789"
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
                  className="form-input"
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
                className="form-input"
              >
                <option value="1">Người hiến máu</option>
                <option value="2">Tổ chức</option>
                <option value="3">Bệnh viện</option>
                <option value="4">Nhóm tình nguyện</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Tiếp tục'}
            </button>

            <div className="auth-footer">
              <span>Đã có tài khoản?</span>
              <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>📧</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                Chúng tôi đã gửi mã xác thực đến
              </p>
              <p style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                {formData.email}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="otp" className="form-label">Mã OTP *</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
                }}
                required
                maxLength="6"
                className="form-input"
                placeholder="Nhập mã 6 số"
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary btn-block"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Xác nhận'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="btn btn-link"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                Gửi lại mã OTP
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-link"
                style={{ fontSize: 'var(--font-size-sm)' }}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
