import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Select Role, 2: Form, 3: OTP, 4: Complete
  const [formData, setFormData] = useState({
    ho_ten: '',
    email: '',
    mat_khau: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    id_vai_tro: null, // Will be set in step 1
    // Additional fields for special roles
    ten_don_vi: '', // For to_chuc
    dia_chi_to_chuc: '', // For to_chuc
    chuc_vu_to_chuc: '', // For to_chuc
    ten_benh_vien: '', // For benh_vien
    dia_chi_benh_vien: '', // For benh_vien
    chuc_vu_benh_vien: '', // For benh_vien
    ten_nhom: '', // For nhom_tinh_nguyen
    dia_chi_nhom: '' // For nhom_tinh_nguyen
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  // Auto focus first OTP input when step 3 is active
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

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

  // Step 1: Select role
  const handleSelectRole = (roleId) => {
    setFormData({
      ...formData,
      id_vai_tro: parseInt(roleId)
    });
    setStep(2);
    setError('');
  };

  // Step 2: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-registration-otp', {
        email: formData.email
      });
      
      if (response.data.success) {
        setStep(3);
        setOtp(['', '', '', '', '', '']);
        // Focus first input after a short delay
        setTimeout(() => {
          const firstInput = document.getElementById('otp-0');
          if (firstInput) firstInput.focus();
        }, 100);
        toast.success('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle OTP input
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')].slice(0, 6));
      setError('');
      // Focus last input
      const lastInput = document.getElementById(`otp-${Math.min(newOtp.length - 1, 5)}`);
      if (lastInput) lastInput.focus();
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-registration-otp', {
        email: formData.email,
        otp: otpString
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

  // Step 4: Create account
  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        setStep(4);
        const isPendingApproval = [2, 3, 4].includes(formData.id_vai_tro); // to_chuc, benh_vien, nhom_tinh_nguyen
        const message = isPendingApproval 
          ? 'Đăng ký thành công! Tài khoản của bạn đang chờ được duyệt. Vui lòng đăng nhập sau khi được duyệt.'
          : 'Đăng ký thành công! Vui lòng đăng nhập.';
        setTimeout(() => {
          navigate('/login', { state: { message } });
        }, 3000);
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
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
      toast.success('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi lại OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 4) {
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
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>✅</div>
              <h2 style={{ color: 'var(--success-600)', marginBottom: 'var(--spacing-md)' }}>Đăng ký thành công!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Đang chuyển đến trang đăng nhập...</p>
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
  }

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
            <svg width="32" height="32" viewBox="0 0 32 16" fill="currentColor">
              <path d="M16 2C16 2 8 10 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 10 16 2 16 2Z" />
            </svg>
          </div>
          <h1 className="auth-title">Đăng ký tài khoản</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Chọn vai trò của bạn'}
            {step === 2 && 'Điền thông tin để tạo tài khoản'}
            {step === 3 && 'Xác thực email của bạn'}
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
          <div style={{ 
            width: '40px', 
            height: '4px', 
            background: step >= 3 ? 'var(--primary-600)' : 'var(--gray-300)', 
            borderRadius: 'var(--radius-full)' 
          }} />
        </div>

      {error && (
          <div className="alert alert-danger">
          {error}
        </div>
      )}

        {/* Step 1: Select Role */}
        {step === 1 && (
          <div className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-xs)' }}>
                Bạn là:
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
              <button
                type="button"
                onClick={() => handleSelectRole(1)}
                className="btn"
                style={{
                  padding: 'var(--spacing-md)',
                  textAlign: 'left',
                  border: '2px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                  e.currentTarget.style.background = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ fontSize: '28px' }}>🩸</div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                      Người hiến máu
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Đăng ký tham gia hiến máu tình nguyện
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole(2)}
                className="btn"
                style={{
                  padding: 'var(--spacing-md)',
                  textAlign: 'left',
                  border: '2px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                  e.currentTarget.style.background = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ fontSize: '28px' }}>🏢</div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                      Người phụ trách tổ chức
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Tổ chức sự kiện hiến máu
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole(3)}
                className="btn"
                style={{
                  padding: 'var(--spacing-md)',
                  textAlign: 'left',
                  border: '2px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                  e.currentTarget.style.background = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ fontSize: '28px' }}>🏥</div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                      Người phụ trách bệnh viện
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Quản lý và duyệt sự kiện hiến máu
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole(4)}
                className="btn"
                style={{
                  padding: 'var(--spacing-md)',
                  textAlign: 'left',
                  border: '2px solid var(--gray-300)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                  e.currentTarget.style.background = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  <div style={{ fontSize: '28px' }}>👥</div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                      Nhóm tình nguyện
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Chia sẻ thông báo và kêu gọi hiến máu
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="auth-footer" style={{ marginTop: 'var(--spacing-md)' }}>
              <span>Đã có tài khoản?</span>
              <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
            </div>
          </div>
        )}

        {/* Step 2: Fill Form */}
        {step === 2 && (
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

          {/* Additional fields for Tổ chức */}
          {formData.id_vai_tro === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="ten_don_vi" className="form-label">Tên đơn vị *</label>
                <input
                  type="text"
                  id="ten_don_vi"
                  name="ten_don_vi"
                  value={formData.ten_don_vi}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ví dụ: Đoàn Thanh niên TP Đà Nẵng"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dia_chi_to_chuc" className="form-label">Địa chỉ tổ chức *</label>
                <input
                  type="text"
                  id="dia_chi_to_chuc"
                  name="dia_chi_to_chuc"
                  value={formData.dia_chi_to_chuc}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ví dụ: 123 Lê Duẩn, Hải Châu, Đà Nẵng"
                />
              </div>
              <div className="form-group">
                <label htmlFor="chuc_vu_to_chuc" className="form-label">Chức vụ</label>
                <input
                  type="text"
                  id="chuc_vu_to_chuc"
                  name="chuc_vu_to_chuc"
                  value={formData.chuc_vu_to_chuc}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ví dụ: Trưởng ban"
                />
              </div>
            </>
          )}

          {/* Additional fields for Bệnh viện */}
          {formData.id_vai_tro === 3 && (
            <>
              <div className="form-group">
                <label htmlFor="ten_benh_vien" className="form-label">Tên bệnh viện *</label>
                <input
                  type="text"
                  id="ten_benh_vien"
                  name="ten_benh_vien"
                  value={formData.ten_benh_vien}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ví dụ: Bệnh viện Đa khoa Đà Nẵng"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dia_chi_benh_vien" className="form-label">Địa chỉ bệnh viện *</label>
                <input
                  type="text"
                  id="dia_chi_benh_vien"
                  name="dia_chi_benh_vien"
                  value={formData.dia_chi_benh_vien}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ví dụ: 124 Hải Phòng, Thanh Khê, Đà Nẵng"
                />
              </div>
              <div className="form-group">
                <label htmlFor="chuc_vu_benh_vien" className="form-label">Chức vụ</label>
                <input
                  type="text"
                  id="chuc_vu_benh_vien"
                  name="chuc_vu_benh_vien"
                  value={formData.chuc_vu_benh_vien}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ví dụ: Trưởng phòng Y tế"
                />
              </div>
            </>
          )}

          {/* Additional fields for Nhóm tình nguyện */}
          {formData.id_vai_tro === 4 && (
            <>
              <div className="form-group">
                <label htmlFor="ten_nhom" className="form-label">Tên nhóm *</label>
                <input
                  type="text"
                  id="ten_nhom"
                  name="ten_nhom"
                  value={formData.ten_nhom}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Ví dụ: Nhóm Tình nguyện Hiến máu Xanh"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dia_chi_nhom" className="form-label">Địa chỉ nhóm</label>
                <input
                  type="text"
                  id="dia_chi_nhom"
                  name="dia_chi_nhom"
                  value={formData.dia_chi_nhom}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ví dụ: 123 Bạch Đằng, Hải Châu, Đà Nẵng"
                />
              </div>
            </>
          )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)', margin: 'var(--spacing-lg) 0' }}>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn btn-secondary"
            style={{ maxWidth: 100 }}
          >
            Quay lại
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ maxWidth: 220, flex: 1 }}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Tiếp tục'}
          </button>
        </div>

        <div className="auth-footer">
          <span>Đã có tài khoản?</span>
          <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
        </div>
          </form>
        )}

        {/* Step 3: Verify OTP */}
        {step === 3 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ 
                fontSize: '64px', 
                padding: 'var(--spacing-lg)',
                background: 'var(--primary-50)',
                borderRadius: '50%',
                width: '120px',
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-md)'
              }}>
                📧
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: 'var(--spacing-sm)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                Xác thực email
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Chúng tôi đã gửi mã xác thực đến
              </p>
              <p style={{ 
                fontWeight: 'var(--font-weight-bold)', 
                color: 'var(--primary-600)',
                fontSize: 'var(--font-size-md)',
                wordBreak: 'break-word'
              }}>
                {formData.email}
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: 'var(--spacing-md)' }}>
                Nhập mã OTP (6 số)
              </label>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-sm)', 
                justifyContent: 'center',
                marginBottom: 'var(--spacing-md)',
                flexWrap: 'wrap'
              }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="form-input"
                    style={{
                      width: '56px',
                      height: '64px',
                      textAlign: 'center',
                      fontSize: '28px',
                      fontWeight: 'var(--font-weight-bold)',
                      padding: 0,
                      border: `2px solid ${digit ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: digit ? 'var(--primary-50)' : 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'text'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary-600)';
                      e.target.style.boxShadow = '0 0 0 3px var(--primary-100)';
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'scale(1)';
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.value) {
                        e.target.style.borderColor = 'var(--primary-400)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.value && document.activeElement !== e.target) {
                        e.target.style.borderColor = 'var(--gray-300)';
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="btn btn-primary"
                style={{
                  padding: 'var(--spacing-md)',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 'var(--font-weight-medium)',
                  minWidth: '200px'
                }}
              >
                {loading ? <LoadingSpinner size="small" /> : 'Xác nhận'}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-lg)'
            }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="btn btn-link"
                style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--primary-600)',
                  textDecoration: 'none'
                }}
              >
                Gửi lại mã OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="btn btn-link"
                style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                ← Quay lại
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="auth-form">
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>✅</div>
              <h2 style={{ color: 'var(--success-600)', marginBottom: 'var(--spacing-md)' }}>Đăng ký thành công!</h2>
              {[2, 3, 4].includes(formData.id_vai_tro) ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    Tài khoản của bạn đang chờ được duyệt bởi quản trị viên.
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>Đang chuyển đến trang đăng nhập...</p>
              )}
            </div>
          </div>
        )}
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

export default Register;
