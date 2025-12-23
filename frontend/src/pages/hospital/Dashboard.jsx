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
      const response = await api.get('/hospitals/stats');
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
        <h1 className="page-title">Dashboard Bệnh viện</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Quản lý sự kiện và kết quả hiến máu.
        </p>
      </div>

      <div className="grid grid-cols-4">
        <StatCard
          title="Sự kiện chờ duyệt"
          value={stats?.pendingEvents || 0}
          icon="clock"
          color="warning"
          subtitle="Cần xem xét"
        />
        <StatCard
          title="Người hiến máu"
          value={stats?.totalDonors || 0}
          icon="users"
          color="primary"
          subtitle="Đã tham gia"
        />
        <StatCard
          title="Lượng máu"
          value={`${(stats?.bloodCollected || 0).toLocaleString()} ml`}
          icon="droplet"
          color="danger"
          subtitle="Đã thu được"
        />
        <StatCard
          title="Thông báo khẩn cấp"
          value={stats?.notificationsSent || 0}
          icon="bell"
          color="success"
          subtitle="Lượt gửi tới nhóm TN"
        />
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
              onClick={() => navigate('/hospital/events')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 16l4 4 8-8M28 16a12 12 0 11-24 0 12 12 0 0124 0z"/>
              </svg>
              <span>Duyệt sự kiện</span>
            </button>
            <button
              className="btn btn-outline"
              style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
              onClick={() => navigate('/hospital/results')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 16h8M8 20h6M8 12h10M6 28h20a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v20a2 2 0 002 2z"/>
              </svg>
              <span>Cập nhật kết quả</span>
      </button>
            <button
              className="btn btn-outline"
              style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
              onClick={() => navigate('/hospital/notifications')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M24 10a8 8 0 00-16 0c0 5.333-2.667 8-2.667 8h21.334S24 15.333 24 10zM18.73 26a3 3 0 01-5.46 0"/>
              </svg>
              <span>Gửi thông báo</span>
            </button>
            <button
              className="btn btn-outline"
              style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
              onClick={() => navigate('/hospital/blood-type-confirmation')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4s-10 11.667-10 16.667A10 10 0 0026 20.667C26 15.667 16 4 16 4z"/>
                <path d="M11 20l3 3 7-7"/>
              </svg>
              <span>Xác thực nhóm máu</span>
      </button>
          </div>
        </div>
    </div>
    </Layout>
  );
};

export default Dashboard;
