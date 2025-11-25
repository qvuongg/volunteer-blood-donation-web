import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/donors/profile');
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextDonationDate = (lastDonation) => {
    if (!lastDonation) return 'Sẵn sàng hiến máu';
    const lastDate = new Date(lastDonation);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 90); // 90 days after last donation
    const today = new Date();
    if (nextDate <= today) return 'Sẵn sàng hiến máu';
    return nextDate.toLocaleDateString('vi-VN');
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
        <h1 className="page-title">Dashboard Người hiến máu</h1>
        <p className="page-description">
          Chào mừng trở lại, {user?.ho_ten}! Cảm ơn bạn đã tham gia hiến máu tình nguyện.
        </p>
      </div>

      {profile && (
        <>
          <div className="grid grid-cols-4">
            <StatCard
              title="Nhóm máu"
              value={profile.donor?.nhom_mau || '?'}
              icon="droplet"
              color="danger"
              subtitle="Nhóm máu của bạn"
            />
            <StatCard
              title="Tổng lần hiến"
              value={profile.donor?.tong_so_lan_hien || 0}
              icon="heart"
              color="primary"
              subtitle="Lần hiến máu"
            />
            <StatCard
              title="Lần hiến gần nhất"
              value={profile.donor?.lan_hien_gan_nhat 
                ? new Date(profile.donor.lan_hien_gan_nhat).toLocaleDateString('vi-VN')
                : 'Chưa có'}
              icon="clock"
              color="success"
              subtitle="Ngày hiến gần nhất"
            />
            <StatCard
              title="Lần hiến tiếp theo"
              value={getNextDonationDate(profile.donor?.lan_hien_gan_nhat)}
              icon="calendar"
              color="warning"
              subtitle="Có thể hiến lại"
            />
          </div>

          <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thông tin cá nhân</h3>
                <button className="btn btn-sm btn-outline" onClick={() => navigate('/donor/profile')}>
                  Chỉnh sửa
              </button>
              </div>
              <div className="card-body">
                {profile.user && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: 'var(--radius-full)', 
                        background: 'var(--primary-gradient)', 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-3xl)',
                        fontWeight: 'var(--font-weight-bold)',
                        flexShrink: 0
                      }}>
                        {profile.user.ho_ten?.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>{profile.user.ho_ten}</h4>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>{profile.user.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Số điện thoại</p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {profile.user.so_dien_thoai || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Giới tính</p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {profile.user.gioi_tinh}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Ngày sinh</p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {new Date(profile.user.ngay_sinh).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>Tham gia</p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                          {new Date(profile.user.ngay_tao).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
            </div>
          )}
        </div>
        </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thông tin hiến máu</h3>
                <button className="btn btn-sm btn-outline" onClick={() => navigate('/donor/blood-info')}>
                  Cập nhật
              </button>
              </div>
              <div className="card-body">
                {profile.donor ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--spacing-xl)', 
                      background: 'var(--primary-gradient)',
                      borderRadius: 'var(--radius-lg)',
                      color: 'white',
                      position: 'relative'
                    }}>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Nhóm máu</p>
                      <h2 style={{ margin: '8px 0', fontSize: '3rem', fontWeight: 'var(--font-weight-bold)' }}>
                        {profile.donor.nhom_mau || '?'}
                      </h2>
                      {profile.donor.nhom_mau_xac_nhan ? (
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.3)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <path d="M5 7l2 2 4-4M13 7A6 6 0 111 7a6 6 0 0112 0z"/>
                          </svg>
                          Đã xác thực
                        </div>
                      ) : (
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px',
                          background: 'rgba(255, 255, 255, 0.3)',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 9V7M7 5h.01"/>
                          </svg>
                          Chưa xác thực
                        </div>
                      )}
                    </div>
                    {!profile.donor.nhom_mau_xac_nhan && profile.donor.nhom_mau && (
                      <div className="alert alert-info" style={{ marginTop: 0 }}>
                        ℹ️ Nhóm máu sẽ được xác thực chính thức khi bạn hiến máu lần đầu tại bệnh viện.
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Tổng lần hiến</span>
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                          {profile.donor.tong_so_lan_hien} lần
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Tổng lượng máu</span>
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                          {(profile.donor.tong_so_lan_hien * 350).toLocaleString()} ml
                        </span>
                      </div>
                    </div>
            </div>
          ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                      Chưa có thông tin hiến máu
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/donor/blood-info')}>
                      Cập nhật ngay
                    </button>
                  </div>
          )}
              </div>
        </div>
      </div>

          <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card-header">
              <h3 className="card-title">Thao tác nhanh</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-4">
                <button
                  className="btn btn-outline"
                  style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
                  onClick={() => navigate('/donor/events')}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="6" width="24" height="22" rx="2"/>
                    <path d="M4 12h24M10 4v6M22 4v6"/>
                  </svg>
                  <span>Sự kiện hiến máu</span>
        </button>
                <button
                  className="btn btn-outline"
                  style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
                  onClick={() => navigate('/donor/registrations')}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 16h8M8 20h6M8 12h10M6 28h20a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v20a2 2 0 002 2z"/>
                  </svg>
                  <span>Lịch đăng ký</span>
        </button>
                <button
                  className="btn btn-outline"
                  style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
                  onClick={() => navigate('/donor/history')}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="16" cy="16" r="12"/>
                    <path d="M16 8v8l4 4"/>
                  </svg>
                  <span>Lịch sử hiến máu</span>
        </button>
                <button
                  className="btn btn-outline"
                  style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
                  onClick={() => navigate('/donor/locations')}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4a8 8 0 00-8 8c0 6 8 13.33 8 13.33S24 18 24 12a8 8 0 00-8-8z"/>
                    <circle cx="16" cy="12" r="3"/>
                  </svg>
                  <span>Địa điểm</span>
        </button>
      </div>
    </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
