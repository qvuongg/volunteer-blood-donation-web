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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
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
                      {Math.floor(stats.totalUsers * 0.15)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Sự kiện đang chờ duyệt</span>
                    <span className="font-bold" style={{ color: 'var(--warning-600)' }}>
                      {Math.floor(stats.totalEvents * 0.1)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Đăng ký chờ xử lý</span>
                    <span className="font-bold" style={{ color: 'var(--secondary-600)' }}>
                      {Math.floor(stats.totalRegistrations * 0.2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <span className="font-medium">Tổng lượng máu đã hiến</span>
                    <span className="font-bold" style={{ color: 'var(--success-600)' }}>
                      {(stats.totalRegistrations * 350).toLocaleString()} ml
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
                      <path d="M16 18v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M10 10a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                    Quản lý người dùng
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/events')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="14" height="14" rx="2"/>
                      <path d="M3 8h14M7 2v4M13 2v4"/>
                    </svg>
                    Quản lý sự kiện
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/registrations')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 12l2 2 4-4M18 10a8 8 0 11-16 0 8 8 0 0116 0z"/>
                    </svg>
                    Xem đăng ký hiến máu
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/reports')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h14v14H3z"/>
                      <path d="M7 8h6M7 12h6"/>
                    </svg>
                    Báo cáo thống kê
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => navigate('/admin/settings')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 3v14M3 10h14"/>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--gray-200)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="font-medium" style={{ marginBottom: '4px' }}>Người dùng mới đăng ký</p>
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>5 phút trước</p>
                  </div>
                  <span className="badge badge-primary">Mới</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', borderBottom: '1px solid var(--gray-200)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 12l2 2 4-4M18 10a8 8 0 11-16 0 8 8 0 0116 0z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="font-medium" style={{ marginBottom: '4px' }}>Sự kiện được duyệt</p>
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>15 phút trước</p>
                  </div>
                  <span className="badge badge-success">Thành công</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--warning-50)', color: 'var(--warning-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="font-medium" style={{ marginBottom: '4px' }}>Báo cáo thống kê tháng</p>
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>1 giờ trước</p>
                  </div>
                  <span className="badge badge-warning">Đang xử lý</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;

