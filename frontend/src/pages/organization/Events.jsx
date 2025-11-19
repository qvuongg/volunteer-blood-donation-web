import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/organizations/events');
      if (response.data.success) {
        setEvents(response.data.data.events);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'da_duyet': { label: 'Đã duyệt', class: 'badge-success' },
      'cho_duyet': { label: 'Chờ duyệt', class: 'badge-warning' },
      'tu_choi': { label: 'Từ chối', class: 'badge-danger' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-gray' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
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
        <div style={{ flex: 1 }}>
          <h1 className="page-title">Quản lý sự kiện</h1>
          <p className="page-description">Tạo và quản lý các sự kiện hiến máu</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/organization/events/new')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5v10m5-5H5"/>
          </svg>
        Tạo sự kiện mới
      </button>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Chưa có sự kiện nào
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {events.map(event => (
            <div key={event.id_su_kien} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{event.ten_su_kien}</h3>
                  {getStatusBadge(event.trang_thai)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Ngày: {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Số lượng: {event.so_luong_du_kien || 0} người
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                  onClick={() => navigate(`/organization/events/${event.id_su_kien}/registrations`)}
                >
                Xem đăng ký
              </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Events;
