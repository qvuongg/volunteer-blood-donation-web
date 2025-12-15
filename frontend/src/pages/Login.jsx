import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    mat_khau: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.mat_khau);
      
      if (result.success) {
        // Redirect based on role
        const user = JSON.parse(localStorage.getItem('user'));
        const role = user?.ten_vai_tro;
        
        switch (role) {
          case 'nguoi_hien':
            navigate('/');
            break;
          case 'to_chuc':
            navigate('/organization/dashboard');
            break;
          case 'benh_vien':
            navigate('/hospital/dashboard');
            break;
          case 'nhom_tinh_nguyen':
            navigate('/volunteer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
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
        <div className="auth-card" style={{ marginTop: '-158px' }}>
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2C16 2 8 10 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 10 16 2 16 2Z" />
              </svg>
            </div>
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">Chào mừng bạn trở lại</p>
          </div>

      {error && (
          <div className="alert alert-danger">
          {error}
        </div>
      )}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
              <label htmlFor="mat_khau" className="form-label" style={{ marginBottom: 0 }}>Mật khẩu</label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-600)' }}>
                Quên mật khẩu?
              </Link>
            </div>
          <input
            type="password"
            id="mat_khau"
            name="mat_khau"
            value={formData.mat_khau}
            onChange={handleChange}
            required
              className="form-input"
              placeholder="••••••••"
          />
             {/* Ghi nhớ đăng nhập */}
          <div className="form-group" style={{ marginTop: '12px', marginBottom: '-4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-secondary)', gap: '8px', userSelect: 'none', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="remember"
                // You may add checked, onChange to handle state if needed
                style={{ width: 14, height: 14, marginRight: 8 }}
              />
              Ghi nhớ đăng nhập
            </label>
          </div>
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
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
        </button>
      </form>

        <div className="auth-footer">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
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

export default Login;
