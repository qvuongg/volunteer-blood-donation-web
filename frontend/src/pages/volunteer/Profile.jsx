import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const VolunteerProfile = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    ten_nhom: '',
    dia_chi: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    xac_nhan_mat_khau: ''
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/volunteers/profile');
      
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          ho_ten: data.user?.ho_ten || '',
          so_dien_thoai: data.user?.so_dien_thoai || '',
          ten_nhom: data.group?.ten_nhom || '',
          dia_chi: data.group?.dia_chi || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast?.error('Lỗi khi tải thông tin hồ sơ');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/volunteers/profile', formData);
      
      if (response.data.success) {
        toast?.success('Cập nhật thông tin thành công');
        setEditing(false);
        await fetchProfile();
      }
    } catch (error) {
      console.error('Error:', error);
      toast?.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      ho_ten: profile?.user?.ho_ten || '',
      so_dien_thoai: profile?.user?.so_dien_thoai || '',
      ten_nhom: profile?.group?.ten_nhom || '',
      dia_chi: profile?.group?.dia_chi || '',
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.mat_khau_moi !== passwordForm.xac_nhan_mat_khau) {
      toast?.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (passwordForm.mat_khau_moi.length < 6) {
      toast?.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.post('/volunteers/change-password', {
        mat_khau_cu: passwordForm.mat_khau_cu,
        mat_khau_moi: passwordForm.mat_khau_moi
      });
      
      if (response.data.success) {
        toast?.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
        setPasswordForm({
          mat_khau_cu: '',
          mat_khau_moi: '',
          xac_nhan_mat_khau: ''
        });
        
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      toast?.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordForm(false);
    setPasswordForm({
      mat_khau_cu: '',
      mat_khau_moi: '',
      xac_nhan_mat_khau: ''
    });
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
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Hồ sơ nhóm tình nguyện</h1>
          <p className="page-description">Quản lý thông tin cá nhân và bảo mật</p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Profile Header Card */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)',
          color: '#374151',
          marginBottom: 'var(--spacing-md)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.07)'
        }}>
          <div className="card-body" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '600',
              border: '2px solid #FCA5A5',
              margin: '0 auto var(--spacing-sm)'
            }}>
              {profile?.user?.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', margin: 0 }}>
              {profile?.user?.ho_ten}
            </div>
            <div style={{ color: '#6B7280', fontSize: 'var(--font-size-base)' }}>
              {profile?.user?.email}
            </div>
            {profile?.group && (
              <div style={{ marginTop: 'var(--spacing-xs)', color: '#6B7280', fontSize: 'var(--font-size-sm)' }}>
                {profile.group.ten_nhom}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)', 
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '2px solid var(--gray-200)'
        }}>
          <button
            onClick={() => {
              setShowPasswordForm(false);
              setEditing(false);
            }}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: 'none',
              border: 'none',
              borderBottom: !showPasswordForm ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: !showPasswordForm ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: !showPasswordForm ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: 'all 0.2s'
            }}
          >
            Thông tin nhóm
          </button>
          <button
            onClick={() => {
              setShowPasswordForm(true);
              setEditing(false);
            }}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: 'none',
              border: 'none',
              borderBottom: showPasswordForm ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: showPasswordForm ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: showPasswordForm ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-base)',
              transition: 'all 0.2s'
            }}
          >
            Đổi mật khẩu
          </button>
        </div>

        {/* Content */}
        {!showPasswordForm ? (
          editing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Thông tin tài khoản</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Họ và tên</label>
                      <input
                        type="text"
                        name="ho_ten"
                        className="form-input"
                        value={formData.ho_ten}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profile?.user?.email || ''}
                        disabled
                        style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }}
                      />
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Email không thể thay đổi
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        name="so_dien_thoai"
                        className="form-input"
                        value={formData.so_dien_thoai}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {profile?.group && (
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Thông tin nhóm tình nguyện</h3>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label">Tên nhóm</label>
                        <input
                          type="text"
                          name="ten_nhom"
                          className="form-input"
                          value={formData.ten_nhom}
                          onChange={handleChange}
                          required
                          placeholder="Ví dụ: Nhóm Tình Nguyện Hiến Máu Xanh"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Địa chỉ</label>
                        <textarea
                          name="dia_chi"
                          className="form-input"
                          value={formData.dia_chi}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Địa chỉ trụ sở nhóm..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="small" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-2">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Thông tin tài khoản</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Họ và tên
                        </label>
                        <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                          {profile?.user?.ho_ten}
                        </p>
                      </div>

                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Email
                        </label>
                        <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                          {profile?.user?.email}
                        </p>
                      </div>

                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Số điện thoại
                        </label>
                        <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)' }}>
                          {profile?.user?.so_dien_thoai || 'Chưa cập nhật'}
                        </p>
                      </div>

                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                          Vai trò
                        </label>
                        <span className="badge badge-info">Nhóm tình nguyện</span>
                      </div>
                    </div>
                  </div>
                </div>

                {profile?.group && (
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Thông tin nhóm tình nguyện</h3>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Tên nhóm
                          </label>
                          <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
                            {profile.group.ten_nhom}
                          </p>
                        </div>

                        <div>
                          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                            Địa chỉ
                          </label>
                          <p style={{ margin: 0 }}>
                            {profile.group.dia_chi || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Chỉnh sửa thông tin
                </button>
              </div>
            </>
          )
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Đổi mật khẩu</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="mat_khau_cu" className="form-label">Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    id="mat_khau_cu"
                    name="mat_khau_cu"
                    value={passwordForm.mat_khau_cu}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mat_khau_moi" className="form-label">Mật khẩu mới *</label>
                  <input
                    type="password"
                    id="mat_khau_moi"
                    name="mat_khau_moi"
                    value={passwordForm.mat_khau_moi}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="xac_nhan_mat_khau" className="form-label">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    id="xac_nhan_mat_khau"
                    name="xac_nhan_mat_khau"
                    value={passwordForm.xac_nhan_mat_khau}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                    placeholder="Nhập lại mật khẩu mới"
                    minLength={6}
                  />
                </div>

                <div style={{ 
                  background: 'var(--warning-50)', 
                  border: '1px solid var(--warning-200)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--warning-700)' }}>
                    <strong>Lưu ý:</strong> Sau khi đổi mật khẩu thành công, bạn sẽ cần sử dụng mật khẩu mới để đăng nhập lần sau.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--gray-200)' }}>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="btn btn-outline"
                    disabled={changingPassword}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn btn-primary"
                  >
                    {changingPassword ? (
                      <>
                        <LoadingSpinner size="small" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đổi mật khẩu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VolunteerProfile;
