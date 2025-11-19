import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard Tổ chức</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Quản lý sự kiện hiến máu của tổ chức bạn.
        </p>
      </div>

      <div className="grid grid-cols-4">
        <StatCard
          title="Sự kiện"
          value="0"
          icon="calendar"
          color="primary"
          subtitle="Tổng sự kiện"
        />
        <StatCard
          title="Chờ duyệt"
          value="0"
          icon="clock"
          color="warning"
          subtitle="Đăng ký chờ duyệt"
        />
        <StatCard
          title="Đã duyệt"
          value="0"
          icon="check"
          color="success"
          subtitle="Đăng ký đã duyệt"
        />
        <StatCard
          title="Người tham gia"
          value="0"
          icon="users"
          color="secondary"
          subtitle="Tổng số người"
        />
      </div>

      <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="card-header">
          <h3 className="card-title">Thao tác nhanh</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2">
            <button
              className="btn btn-outline"
              style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
              onClick={() => navigate('/organization/events')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="6" width="24" height="22" rx="2"/>
                <path d="M4 12h24M10 4v6M22 4v6"/>
              </svg>
              <span>Quản lý sự kiện</span>
            </button>
            <button
              className="btn btn-outline"
              style={{ flexDirection: 'column', height: '120px', gap: 'var(--spacing-md)' }}
              onClick={() => navigate('/organization/approvals')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 16l4 4 8-8M28 16a12 12 0 11-24 0 12 12 0 0124 0z"/>
              </svg>
              <span>Duyệt đăng ký</span>
      </button>
          </div>
        </div>
    </div>
    </Layout>
  );
};

export default Dashboard;
