import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications via WebSocket
  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket not available in NotificationBell');
      return;
    }

    console.log('✅ Socket available in NotificationBell, isConnected:', isConnected);

    const handleNewNotification = (notification) => {
      console.log('📬 Received new notification:', notification);
      
      // Add to notifications list at the beginning
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      if (toast) {
        toast.success(notification.tieu_de, {
          duration: 5000
        });
      }
      
      // Play notification sound (optional)
      playNotificationSound();
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, isConnected, toast]);

  const playNotificationSound = () => {
    try {
      // You can add a notification sound file to public folder
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (err) {
      console.log('Notification sound not available');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=10');
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id_thong_bao === id ? { ...n, da_doc: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await api.put('/notifications/read-all');
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      if (toast) {
        toast.error('Không thể đánh dấu tất cả đã đọc');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.da_doc) {
      await handleMarkAsRead(notification.id_thong_bao);
    }
    
    // Navigate to link if available
    if (notification.link_lien_ket) {
      navigate(notification.link_lien_ket);
    }
    
    setShowDropdown(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dang_ky_duyet':
        return '✅';
      case 'su_kien_duyet':
        return '📅';
      case 'nhom_mau_xac_nhan':
        return '🩸';
      case 'ket_qua_hien_mau':
        return '📋';
      default:
        return '🔔';
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

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="notification-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Thông báo"
        title={isConnected ? 'Thông báo (Realtime)' : 'Thông báo (Offline)'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path
            d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5788 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42117 18.2537 9.16815 18.1079C8.91513 17.9622 8.70484 17.7526 8.55835 17.5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {/* Connection indicator */}
        {!isConnected && (
          <span style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#f59e0b',
            border: '2px solid white'
          }} title="Đang kết nối lại..." />
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor">
                  <path
                    d="M36 14C36 11.2435 34.8946 8.6003 32.9315 6.63706C30.9684 4.67382 28.3261 3.56856 25.5696 3.56836H22.4304C19.6739 3.56856 17.0316 4.67382 15.0685 6.63706C13.1054 8.6003 12 11.2435 12 14C12 28.5 6 32.5 6 32.5H42C42 32.5 36 28.5 36 14Z"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M27.33 40C27.06 40.64 26.6213 41.1974 26.0588 41.6068C25.4963 42.0162 24.8323 42.2625 24.15 42.2625C23.4677 42.2625 22.8037 42.0162 22.2412 41.6068C21.6787 41.1974 21.24 40.64 20.97 40"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="8" y1="8" x2="40" y2="40" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id_thong_bao}
                  className={`notification-item ${!notif.da_doc ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.loai_thong_bao)}
                  </div>
                  <div className="notification-content">
                    <h4>{notif.tieu_de}</h4>
                    <p>{notif.noi_dung}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notif.ngay_tao)}
                    </span>
                  </div>
                  {!notif.da_doc && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button onClick={() => {
                navigate('/notifications');
                setShowDropdown(false);
              }}>
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
