import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const HospitalProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    chuc_vu: '',
    nguoi_lien_he: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userResponse = await api.get('/auth/profile');
      
      if (userResponse.data.success) {
        const data = userResponse.data.data;
        setProfile(data);
        setFormData({
          ho_ten: data.user?.ho_ten || '',
          so_dien_thoai: data.user?.so_dien_thoai || '',
          chuc_vu: data.coordinator?.chuc_vu || '',
          nguoi_lien_he: data.coordinator?.nguoi_lien_he || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Lỗi khi tải thông tin hồ sơ');
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
      const response = await api.put('/hospitals/profile', formData);
      
      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công');
        setEditing(false);
        await fetchProfile();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data
    setFormData({
      ho_ten: profile?.user?.ho_ten || '',
      so_dien_thoai: profile?.user?.so_dien_thoai || '',
      chuc_vu: profile?.coordinator?.chuc_vu || '',
      nguoi_lien_he: profile?.coordinator?.nguoi_lien_he || ''
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
        <h1 className="page-title">Hồ sơ bệnh viện</h1>
        <p className="page-description">Thông tin tài khoản và bệnh viện</p>
        </div>
      </div>

      {editing ? (
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

                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <div>
                    <span className="badge badge-info">Người phụ trách bệnh viện</span>
                  </div>
                </div>
              </div>
            </div>

            {profile?.hospital && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Thông tin bệnh viện</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Tên bệnh viện</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profile.hospital.ten_benh_vien}
                      disabled
                      style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Tên bệnh viện không thể thay đổi
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-input"
                      value={profile.hospital.dia_chi}
                      disabled
                      rows={3}
                      style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Địa chỉ bệnh viện không thể thay đổi
                    </p>
                  </div>

                  {profile.coordinator && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Chức vụ</label>
                        <input
                          type="text"
                          name="chuc_vu"
                          className="form-input"
                          value={formData.chuc_vu}
                          onChange={handleChange}
                          placeholder="Ví dụ: Bác sĩ, Y tá trưởng..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Người liên hệ</label>
                        <input
                          type="text"
                          name="nguoi_lien_he"
                          className="form-input"
                          value={formData.nguoi_lien_he}
                          onChange={handleChange}
                          placeholder="Tên người liên hệ"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Hủy
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
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                  {profile?.user?.ho_ten}
                </p>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Email
                </label>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                  {profile?.user?.email}
                </p>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Số điện thoại
                </label>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                  {profile?.user?.so_dien_thoai || 'Chưa cập nhật'}
                </p>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                  Vai trò
                </label>
                    <span className="badge badge-info">Người phụ trách bệnh viện</span>
              </div>
            </div>
          </div>
        </div>

        {profile?.hospital && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin bệnh viện</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Tên bệnh viện
                  </label>
                  <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-lg)' }}>
                    {profile.hospital.ten_benh_vien}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                    Địa chỉ
                  </label>
                  <p style={{ margin: 0 }}>
                    {profile.hospital.dia_chi}
                  </p>
                </div>

                {profile.coordinator && (
                  <>
                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                        Chức vụ
                      </label>
                      <p style={{ margin: 0 }}>
                        {profile.coordinator.chuc_vu || 'Chưa cập nhật'}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                        Người liên hệ
                      </label>
                      <p style={{ margin: 0 }}>
                        {profile.coordinator.nguoi_lien_he || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </>
                )}
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
              Chỉnh sửa
            </button>
          </div>
        </>
      )}
    </Layout>
  );
};

export default HospitalProfile;
