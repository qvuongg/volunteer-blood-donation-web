import { useState } from 'react';
import Layout from '../../components/Layout';

const Settings = () => {
  const [emailSettings, setEmailSettings] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: '',
    from: ''
  });
  const [otpSettings, setOtpSettings] = useState({
    expiryMinutes: '10'
  });
  const [saved, setSaved] = useState(false);

  const handleEmailChange = (key, value) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleOtpChange = (key, value) => {
    setOtpSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to save settings
    alert('Tính năng đang phát triển. Cấu hình email và OTP hiện được quản lý qua file .env');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Cài đặt hệ thống</h1>
        <p className="page-description">
          Quản lý cấu hình hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1" style={{ gap: 'var(--spacing-lg)' }}>
        {/* Email Configuration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cấu hình Email</h3>
          </div>
          <div className="card-body">
            <div className="alert" style={{ background: 'var(--warning-50)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <strong>Lưu ý:</strong> Hiện tại cấu hình email được quản lý qua file <code>backend/.env</code>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">SMTP Host</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSettings.host}
                  onChange={(e) => handleEmailChange('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  disabled
                />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Máy chủ SMTP để gửi email
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSettings.port}
                  onChange={(e) => handleEmailChange('port', e.target.value)}
                  placeholder="587"
                  disabled
                />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Cổng kết nối SMTP (thường là 587 hoặc 465)
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Email người gửi</label>
                <input
                  type="email"
                  className="form-input"
                  value={emailSettings.user}
                  onChange={(e) => handleEmailChange('user', e.target.value)}
                  placeholder="your-email@gmail.com"
                  disabled
                />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Email dùng để gửi thông báo
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Tên người gửi</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailSettings.from}
                  onChange={(e) => handleEmailChange('from', e.target.value)}
                  placeholder="Hệ thống hiến máu Đà Nẵng"
                  disabled
                />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Tên hiển thị khi gửi email
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* OTP Configuration */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cấu hình OTP</h3>
          </div>
          <div className="card-body">
            <div className="alert" style={{ background: 'var(--info-50)', border: '1px solid var(--info-200)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <strong>Thông tin:</strong> OTP được sử dụng để xác thực đăng ký và đặt lại mật khẩu
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Thời gian hiệu lực OTP (phút)</label>
                <input
                  type="number"
                  className="form-input"
                  value={otpSettings.expiryMinutes}
                  onChange={(e) => handleOtpChange('expiryMinutes', e.target.value)}
                  min="1"
                  max="60"
                  disabled
                />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  Mã OTP sẽ hết hạn sau số phút này
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Thông tin hệ thống</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Phiên bản hệ thống</span>
                <span className="badge badge-primary">v1.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Database</span>
                <span className="badge badge-success">MySQL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Backend</span>
                <span className="badge badge-secondary">Node.js + Express</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Frontend</span>
                <span className="badge badge-secondary">React</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quản lý Database</h3>
          </div>
          <div className="card-body">
            <div className="alert" style={{ background: 'var(--danger-50)', border: '1px solid var(--danger-200)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <strong>Cảnh báo:</strong> Các thao tác này có thể ảnh hưởng đến dữ liệu hệ thống. Vui lòng sao lưu trước khi thực hiện.
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert('Tính năng đang phát triển')}
              >
                Sao lưu Database
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => alert('Tính năng đang phát triển')}
              >
                Khôi phục Database
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu? Hành động này KHÔNG THỂ hoàn tác!')) {
                    alert('Tính năng đang phát triển');
                  }
                }}
              >
                Xóa tất cả dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div style={{
          position: 'fixed',
          bottom: 'var(--spacing-lg)',
          right: 'var(--spacing-lg)',
          background: 'var(--success-600)',
          color: 'white',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          Cài đặt đã được lưu!
        </div>
      )}
    </Layout>
  );
};

export default Settings;

