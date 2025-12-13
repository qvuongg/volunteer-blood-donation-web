import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP, 3: đặt mật khẩu mới
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    mat_khau_moi: '',
    xac_nhan_mat_khau: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleFindDrive = () => {
    const q = searchQuery.trim();
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate(q ? `/donor/events?search=${encodeURIComponent(q)}` : '/donor/events');
    } else {
      navigate(q ? `/events?search=${encodeURIComponent(q)}` : '/events');
    }
  };

  const handlePrimaryCta = () => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate('/donor/events');
    } else {
      navigate('/register');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: formData.email });
      if (response.data.success) {
        setSuccess('Mã OTP đã được gửi đến email của bạn.');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', { 
        email: formData.email, 
        otp: formData.otp 
      });
      if (response.data.success) {
        setSuccess('Mã OTP hợp lệ. Vui lòng đặt mật khẩu mới.');
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.mat_khau_moi !== formData.xac_nhan_mat_khau) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (formData.mat_khau_moi.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        mat_khau_moi: formData.mat_khau_moi
      });
      if (response.data.success) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HomeHeader
        user={user}
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        handleFindDrive={handleFindDrive}
        handlePrimaryCta={handlePrimaryCta}
      />
      <div className="auth-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4xl) var(--spacing-xl)' }}>
        <div className="auth-card">
          <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 2C16 2 8 10 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 10 16 2 16 2Z" />
            </svg>
          </div>
          <h1 className="auth-title">Quên mật khẩu</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Nhập email để nhận mã xác thực'}
            {step === 2 && 'Nhập mã OTP đã gửi đến email'}
            {step === 3 && 'Đặt mật khẩu mới'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  Đang gửi...
                </>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label htmlFor="otp" className="form-label">Mã OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                className="form-input"
                placeholder="Nhập 6 số"
              />
              <p className="form-helper">Kiểm tra email của bạn để lấy mã OTP</p>
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
                  Đang xác thực...
                </>
              ) : (
                'Xác thực OTP'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-ghost"
              style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
            >
              Gửi lại mã
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="mat_khau_moi" className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                id="mat_khau_moi"
                name="mat_khau_moi"
                value={formData.mat_khau_moi}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label htmlFor="xac_nhan_mat_khau" className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="xac_nhan_mat_khau"
                name="xac_nhan_mat_khau"
                value={formData.xac_nhan_mat_khau}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
              />
              <p className="form-helper">Tối thiểu 6 ký tự</p>
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
                  Đang cập nhật...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
        </div>
        </div>
      </div>
      <HomeFooter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleFindDrive={handleFindDrive}
      />
    </div>
  );
};

export default ForgotPassword;


