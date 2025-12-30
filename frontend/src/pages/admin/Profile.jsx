import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

const AdminProfile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: '',
    so_dien_thoai: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/admin/profile');
      
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          ho_ten: data.user?.ho_ten || '',
          so_dien_thoai: data.user?.so_dien_thoai || ''
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
      const response = await api.put('/admin/profile', formData);
      
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
      so_dien_thoai: profile?.user?.so_dien_thoai || ''
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
          <h1 className="page-title">Hồ sơ quản trị viên</h1>
          <p className="page-description">Thông tin tài khoản quản trị</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                    placeholder="0123456789"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <div>
                    <span className="badge badge-danger">Quản trị viên hệ thống</span>
                  </div>
                </div>
              </div>
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
          </div>
        </form>
      ) : (
        <>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                    <span className="badge badge-danger">Quản trị viên hệ thống</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)' }}>
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminProfile;






