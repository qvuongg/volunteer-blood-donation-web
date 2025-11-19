import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const HospitalProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Get user info and hospital info
      const userResponse = await api.get('/auth/profile');
      
      if (userResponse.data.success) {
        setProfile(userResponse.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="page-title">Hồ sơ bệnh viện</h1>
        <p className="page-description">Thông tin tài khoản và bệnh viện</p>
      </div>

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
                <span className="badge badge-info">Bệnh viện</span>
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
    </Layout>
  );
};

export default HospitalProfile;

