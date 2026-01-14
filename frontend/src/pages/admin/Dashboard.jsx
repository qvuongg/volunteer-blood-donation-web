import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activities/recent?limit=5')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data.activities);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 3600) return `${Math.max(1, Math.floor(diffInSeconds / 60))} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return past.toLocaleDateString('vi-VN');
  };

  const getActivityIcon = (type) => {
    const configs = {
      user_registered: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
          </svg>
        ),
        bgColor: 'var(--primary-50)',
        color: 'var(--primary-600)'
      },
      event_approved: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 12l2 2 4-4M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
        ),
        bgColor: 'var(--success-50)',
        color: 'var(--success-600)'
      },
      event_rejected: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm5 11l-1.5 1.5L10 11l-3.5 3.5L5 13l3.5-3.5L5 6l1.5-1.5L10 8l3.5-3.5L15 6l-3.5 3.5L15 13z" />
          </svg>
        ),
        bgColor: 'var(--danger-50)',
        color: 'var(--danger-600)'
      }
    };
    return configs[type] || configs.user_registered;
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
        <h1 className="page-title">Dashboard Quản trị viên</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Đây là tổng quan hệ thống hiến máu.
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-4">
            <StatCard
              title="Tổng người dùng"
              value={stats.totalUsers || 0}
              icon="users"
              color="primary"
              subtitle="Người dùng đã đăng ký"
            />
            <StatCard
              title="Người hiến máu"
              value={stats.totalDonors || 0}
              icon="droplet"
              color="danger"
              subtitle="Người hiến máu active"
            />
            <StatCard
              title="Sự kiện"
              value={stats.totalEvents || 0}
              icon="calendar"
              color="success"
              subtitle="Sự kiện đã tạo"
            />
            <StatCard
              title="Đăng ký"
              value={stats.totalRegistrations || 0}
              icon="check"
              color="warning"
              subtitle="Lượt đăng ký hiến máu"
            />
          </div>

          <div className="grid grid-cols-2" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thống kê nhanh</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Người dùng mới (tháng này)</span>
                    <span className="font-bold" style={{ color: 'var(--primary-600)' }}>
                      {stats.newUsersThisMonth || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Sự kiện đang chờ duyệt</span>
                    <span className="font-bold" style={{ color: 'var(--warning-600)' }}>
                      {stats.pendingEvents || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Đăng ký chờ xử lý</span>
                    <span className="font-bold" style={{ color: 'var(--secondary-600)' }}>
                      {stats.pendingRegistrations || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Tổng lượng máu đã hiến</span>
                    <span className="font-bold" style={{ color: 'var(--success-600)' }}>
                      {(stats.totalBloodDonated || 0).toLocaleString()} ml
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Thao tác nhanh</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/users')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 18v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    Quản lý người dùng
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/events')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="14" height="14" rx="2" />
                      <path d="M3 8h14M7 2v4M13 2v4" />
                    </svg>
                    Quản lý sự kiện
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/registrations')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 12l2 2 4-4M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                    </svg>
                    Xem đăng ký hiến máu
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/reports')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h14v14H3z" />
                      <path d="M7 8h6M7 12h6" />
                    </svg>
                    Báo cáo thống kê
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/settings')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 3v14M3 10h14" />
                    </svg>
                    Cài đặt hệ thống
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="card-header">
              <h3 className="card-title">Hoạt động gần đây</h3>
            </div>
            <div className="card-body">
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                  Chưa có hoạt động nào
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {activities.map((activity, index) => {
                    const isLast = index === activities.length - 1;
                    const timeAgo = getTimeAgo(activity.timestamp);
                    const iconConfig = getActivityIcon(activity.type);

                    return (
                      <div
                        key={activity.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--spacing-md)',
                          padding: 'var(--spacing-md)',
                          borderBottom: isLast ? 'none' : '1px solid var(--gray-200)'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-full)',
                          background: iconConfig.bgColor,
                          color: iconConfig.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {iconConfig.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="font-medium" style={{ marginBottom: '4px' }}>{activity.title}</p>
                          <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                            {activity.description} • {timeAgo}
                          </p>
                        </div>
                        <span className={`badge badge-${activity.badge}`}>{activity.badgeText}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;

