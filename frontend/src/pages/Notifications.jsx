import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Notifications = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=100');
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id_thong_bao === id ? { ...n, da_doc: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;

    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id_thong_bao !== id));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.da_doc) {
      await handleMarkAsRead(notification.id_thong_bao);
    }
    
    if (notification.link_lien_ket) {
      navigate(notification.link_lien_ket);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dang_ky_thanh_cong':
        return { icon: '🎉', color: '#10b981' };
      case 'dang_ky_moi':
        return { icon: '📝', color: '#3b82f6' };
      case 'dang_ky_duyet':
        return { icon: '✅', color: '#10b981' };
      case 'su_kien_duyet':
        return { icon: '📅', color: '#10b981' };
      case 'nhom_mau_xac_nhan':
        return { icon: '🩸', color: '#dc2626' };
      case 'ket_qua_hien_mau':
        return { icon: '📋', color: '#059669' };
      case 'benh_vien_notification':
        return { icon: '🚨', color: '#f59e0b' };
      case 'su_kien_huy':
        return { icon: '🚫', color: '#dc2626' };
      default:
        return { icon: '🔔', color: '#6b7280' };
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notifDate = new Date(dateString);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.da_doc;
    if (filter === 'read') return n.da_doc;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.da_doc).length;

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
        <h1 className="page-title">Thông báo</h1>
        <p className="page-description">
          Tất cả thông báo của bạn
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          {/* Filter tabs */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--gray-200)',
            paddingBottom: 'var(--spacing-md)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: filter === 'all' ? 'var(--primary-50)' : 'transparent',
                  border: 'none',
                  borderBottom: filter === 'all' ? '2px solid var(--primary-600)' : 'none',
                  color: filter === 'all' ? 'var(--primary-600)' : 'var(--text-secondary)',
                  fontWeight: filter === 'all' ? 'var(--font-weight-semibold)' : 'normal',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: filter === 'unread' ? 'var(--primary-50)' : 'transparent',
                  border: 'none',
                  borderBottom: filter === 'unread' ? '2px solid var(--primary-600)' : 'none',
                  color: filter === 'unread' ? 'var(--primary-600)' : 'var(--text-secondary)',
                  fontWeight: filter === 'unread' ? 'var(--font-weight-semibold)' : 'normal',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                Chưa đọc ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: filter === 'read' ? 'var(--primary-50)' : 'transparent',
                  border: 'none',
                  borderBottom: filter === 'read' ? '2px solid var(--primary-600)' : 'none',
                  color: filter === 'read' ? 'var(--primary-600)' : 'var(--text-secondary)',
                  fontWeight: filter === 'read' ? 'var(--font-weight-semibold)' : 'normal',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                Đã đọc ({notifications.length - unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn btn-sm btn-outline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notifications list */}
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'var(--text-secondary)' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" style={{ margin: '0 auto var(--spacing-lg)' }}>
                <path d="M48 21.3333C48 16.9797 46.2095 12.8049 43.0339 9.6293C39.8583 6.45371 35.6835 4.66333 31.3299 4.66333H28.6701C24.3165 4.66333 20.1417 6.45371 16.9661 9.6293C13.7905 12.8049 12 16.9797 12 21.3333C12 42 8 46 8 46H56C56 46 52 42 52 21.3333Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M36.44 56C36.08 56.96 35.4951 57.7897 34.7451 58.4091C33.9951 59.0284 33.1098 59.4167 32.18 59.4167C31.2502 59.4167 30.3649 59.0284 29.6149 58.4091C28.8649 57.7897 28.28 56.96 27.92 56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="12" x2="52" y2="52" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p>
                {filter === 'all' && 'Chưa có thông báo nào'}
                {filter === 'unread' && 'Không có thông báo chưa đọc'}
                {filter === 'read' && 'Không có thông báo đã đọc'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {filteredNotifications.map((notif) => {
                const iconData = getNotificationIcon(notif.loai_thong_bao);
                return (
                  <div
                    key={notif.id_thong_bao}
                    style={{
                      padding: 'var(--spacing-lg)',
                      background: !notif.da_doc ? 'var(--primary-50)' : 'white',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      cursor: notif.link_lien_ket ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: 'var(--spacing-md)',
                      position: 'relative'
                    }}
                    onClick={() => handleNotificationClick(notif)}
                    onMouseEnter={(e) => {
                      if (notif.link_lien_ket) {
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      {iconData.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-xs)' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text-primary)'
                        }}>
                          {notif.tieu_de}
                        </h4>
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                          marginLeft: 'var(--spacing-md)'
                        }}>
                          {formatTimeAgo(notif.ngay_tao)}
                        </span>
                      </div>
                      
                      <p style={{
                        margin: 0,
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        lineHeight: 'var(--line-height-relaxed)'
                      }}>
                        {notif.noi_dung}
                      </p>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        marginTop: 'var(--spacing-md)'
                      }}>
                        {!notif.da_doc && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id_thong_bao);
                            }}
                            style={{
                              padding: '4px 8px',
                              fontSize: 'var(--font-size-xs)',
                              background: 'transparent',
                              border: '1px solid var(--primary-600)',
                              color: 'var(--primary-600)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontWeight: 'var(--font-weight-medium)'
                            }}
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id_thong_bao);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: 'var(--font-size-xs)',
                            background: 'transparent',
                            border: '1px solid var(--gray-300)',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!notif.da_doc && (
                      <div style={{
                        position: 'absolute',
                        top: 'var(--spacing-lg)',
                        right: 'var(--spacing-lg)',
                        width: '8px',
                        height: '8px',
                        background: 'var(--primary-600)',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const notifDate = new Date(dateString);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return notifDate.toLocaleDateString('vi-VN');
};

export default Notifications;
