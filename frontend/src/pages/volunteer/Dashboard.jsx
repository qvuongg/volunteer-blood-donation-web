import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/volunteers/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
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
        <h1 className="page-title">Dashboard Tình nguyện viên</h1>
        <p className="page-description">
          Chào mừng, {user?.ho_ten}. Xem các thông báo kêu gọi hiến máu khẩn cấp.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Thông báo khẩn cấp</h3>
          <span className="badge badge-danger">{notifications.length} mới</span>
        </div>
        <div className="card-body">
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
                <path d="M48 20a16 16 0 00-32 0c0 10.667-5.333 16-5.333 16h42.666S48 30.667 48 20zM37.46 52a6 6 0 01-10.92 0"/>
              </svg>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                Không có thông báo mới
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {notifications.map(notif => (
                <div 
                  key={notif.id_thong_bao}
                  style={{
                    padding: 'var(--spacing-lg)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-lg)',
                    background: notif.da_doc ? 'white' : 'var(--primary-50)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--spacing-md)' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--danger-500)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3s-8 7.5-8 10a8 8 0 0016 0c0-2.5-8-10-8-10z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-sm)' }}>
                        <h4 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                          {notif.tieu_de}
                        </h4>
                        {!notif.da_doc && <span className="badge badge-danger">Mới</span>}
                      </div>
                      <p style={{ margin: '0 0 var(--spacing-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                        {notif.noi_dung}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="2" width="12" height="10" rx="1"/>
                          <path d="M1 5h12M4 1v2M10 1v2"/>
                        </svg>
                        <span>{new Date(notif.ngay_tao).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span>{notif.ten_benh_vien}</span>
                      </div>
                    </div>
                  </div>
        </div>
      ))}
    </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
