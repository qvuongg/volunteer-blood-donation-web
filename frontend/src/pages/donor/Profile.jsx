import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    gioi_tinh: 'Nam',
    ngay_sinh: '',
    cccd: '',
    nhom_mau: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    xac_nhan_mat_khau: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/donors/profile');
      if (response.data.success && response.data.data.user) {
        const user = response.data.data.user;
        const donor = response.data.data.donor || {};

        setProfile(response.data.data);
        setFormData({
          ho_ten: user.ho_ten || '',
          so_dien_thoai: user.so_dien_thoai || '',
          gioi_tinh: user.gioi_tinh || 'Nam',
          ngay_sinh: user.ngay_sinh ? user.ngay_sinh.split('T')[0] : '',
          cccd: user.cccd || '',
          nhom_mau: donor.nhom_mau || ''
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

    try {
      const response = await api.put('/donors/profile', formData);
      if (response.data.success) {
        toast?.success('Cập nhật thông tin thành công');
        setEditing(false);
        // Update profile state directly with response data
        if (response.data.data) {
          const { user, donor } = response.data.data;
          setProfile(prev => ({ ...prev, user, donor: donor || prev.donor }));
        } else {
          await fetchProfile(); // Fallback
        }
      }
    } catch (error) {
      toast?.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (profile?.user) {
      setFormData({
        ho_ten: profile.user.ho_ten || '',
        so_dien_thoai: profile.user.so_dien_thoai || '',
        gioi_tinh: profile.user.gioi_tinh || 'Nam',
        ngay_sinh: profile.user.ngay_sinh ? profile.user.ngay_sinh.split('T')[0] : '',
        cccd: profile.user.cccd || '',
        nhom_mau: profile.donor?.nhom_mau || ''
      });
    }
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
      const response = await api.post('/donors/change-password', {
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

        // Đăng xuất và chuyển hướng đến trang đăng nhập sau 1.5 giây
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

  const isBloodTypeVerified = !!profile?.donor?.nhom_mau_xac_nhan;

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Hồ sơ cá nhân</h1>
        <p className="page-description">
          Quản lý thông tin cá nhân và bảo mật
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            Thông tin cá nhân
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
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Chỉnh sửa thông tin</h3>
                </div>
                <div className="card-body">
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
                    <label htmlFor="cccd" className="form-label">Số CCCD/CMND *</label>
                    <input
                      type="text"
                      id="cccd"
                      name="cccd"
                      value={formData.cccd}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Số căn cước công dân"
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
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nhom_mau" className="form-label">
                      Nhóm máu
                      {isBloodTypeVerified ? (
                        <span style={{ fontSize: '0.8em', color: '#16a34a', marginLeft: '8px', fontWeight: 'bold' }}>
                          ✓ Đã xác thực y tế (Không thể sửa)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8em', color: '#dc2626', marginLeft: '8px' }}>
                          (Chưa xác thực)
                        </span>
                      )}
                    </label>
                    {isBloodTypeVerified ? (
                      <div className="form-input" style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}>
                        {profile?.donor?.nhom_mau || 'Chưa có'}
                      </div>
                    ) : (
                      <select
                        id="nhom_mau"
                        name="nhom_mau"
                        value={formData.nhom_mau}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">-- Chọn nhóm máu --</option>
                        <option value="O">O</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                      </select>
                    )}
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {isBloodTypeVerified
                        ? `Được xác thực bởi ${profile?.donor?.ten_benh_vien_xac_nhan} vào ngày ${new Date(profile?.donor?.ngay_xac_nhan).toLocaleDateString('vi-VN')}`
                        : 'Đây là thông tin tự khai báo. Thông tin chính xác sẽ được cập nhật sau khi bạn tham gia hiến máu.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--gray-200)' }}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-outline"
                      disabled={saving}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
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
                </div>
              </div>
            </form>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thông tin chi tiết</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-xl)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Họ tên
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                      {profile?.user?.ho_ten}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Số CCCD/CMND
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                      {profile?.user?.cccd || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Email
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                      {profile?.user?.email}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Số điện thoại
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: profile?.user?.so_dien_thoai ? 'inherit' : 'var(--text-secondary)' }}>
                      {profile?.user?.so_dien_thoai || 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Giới tính
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                      {profile?.user?.gioi_tinh}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Ngày sinh
                    </label>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: profile?.user?.ngay_sinh ? 'inherit' : 'var(--text-secondary)' }}>
                      {profile?.user?.ngay_sinh ? new Date(profile.user.ngay_sinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                      Nhóm máu
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: '#dc2626' }}>
                        {profile?.donor?.nhom_mau || 'Chưa cập nhật'}
                      </span>
                      {profile?.donor?.nhom_mau && (
                        isBloodTypeVerified ? (
                          <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Đã xác thực</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.75rem', color: '#854d0e', background: '#fef9c3', border: '1px solid #fde047' }}>Tự khai báo</span>
                        )
                      )}
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--gray-200)', marginTop: 'var(--spacing-xl)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="card">
            {/* Same password form content ... keeping it simple for replacement */}
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

export default Profile;
