import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
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

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/volunteers/notifications/${id}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id_thong_bao === id ? { ...n, da_doc: true } : n)
      );
      toast?.success('Đã đánh dấu đã đọc');
    } catch (error) {
      console.error('Error:', error);
      toast?.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleCopyLink = (notif) => {
    const link = `${window.location.origin}/volunteer/notifications/${notif.id_thong_bao}`;
    navigator.clipboard.writeText(link).then(() => {
      toast?.success('Đã sao chép link thông báo');
    }).catch(() => {
      toast?.error('Không thể sao chép link');
    });
  };

  const handleShareFacebook = (notif) => {
    const url = encodeURIComponent(`${window.location.origin}/volunteer/notifications/${notif.id_thong_bao}`);
    const text = encodeURIComponent(`${notif.tieu_de}\n\n${notif.noi_dung}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
  };

  const handleShareZalo = (notif) => {
    const url = encodeURIComponent(`${window.location.origin}/volunteer/notifications/${notif.id_thong_bao}`);
    window.open(`https://zalo.me/share?url=${url}`, '_blank', 'width=600,height=400');
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="2" width="12" height="10" rx="1"/>
                          <path d="M1 5h12M4 1v2M10 1v2"/>
                        </svg>
                        <span>{new Date(notif.ngay_tao).toLocaleDateString('vi-VN')}</span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                        {!notif.da_doc && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleMarkAsRead(notif.id_thong_bao)}
                            style={{ fontSize: 'var(--font-size-xs)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                              <path d="M11.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L4.5 9.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                            </svg>
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleShareFacebook(notif)}
                          style={{ fontSize: 'var(--font-size-xs)', color: '#1877F2' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleShareZalo(notif)}
                          style={{ fontSize: 'var(--font-size-xs)', color: '#0068FF' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          </svg>
                          Zalo
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleCopyLink(notif)}
                          style={{ fontSize: 'var(--font-size-xs)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                            <path d="M10.854 3.646a.5.5 0 0 0-.708 0L7 6.793l-.646-.647a.5.5 0 1 0-.708.708l1 1a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708z"/>
                            <path d="M4.5 13a.5.5 0 0 1-.354-.146l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L1.207 8.5l3.647 3.646a.5.5 0 0 1-.354.854zm5 0a.5.5 0 0 1-.354-.854L12.793 8.5 9.146 4.854a.5.5 0 1 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4A.5.5 0 0 1 9.5 13z"/>
                          </svg>
                          Copy link
                        </button>
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
