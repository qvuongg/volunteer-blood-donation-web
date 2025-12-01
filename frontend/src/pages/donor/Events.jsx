import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      if (response.data.success) {
        setEvents(response.data.data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Trạng thái theo thời gian (đang diễn ra / đã kết thúc / sắp diễn ra)
  const getTimeStatus = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(event.ngay_ket_thuc || event.ngay_bat_dau);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) {
      return { label: 'Đã kết thúc', class: 'badge-gray' };
    }
    if (startDate > today) {
      return { label: 'Sắp diễn ra', class: 'badge-warning' };
    }
    return { label: 'Đang diễn ra', class: 'badge-success' };
  };

  const getStatusBadge = (event) => {
    const statusInfo = getTimeStatus(event);
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  const filteredEvents = events.filter(event =>
    event.ten_su_kien.toLowerCase().includes(search.toLowerCase()) ||
    event.ten_don_vi.toLowerCase().includes(search.toLowerCase()) ||
    event.ten_benh_vien.toLowerCase().includes(search.toLowerCase())
  );

  // Sắp xếp lại phía frontend để khớp với yêu cầu:
  // - Sự kiện đang/sắp diễn ra trước, đã kết thúc sau
  // - Sự kiện càng cũ càng ở cuối
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endA = new Date(a.ngay_ket_thuc || a.ngay_bat_dau);
    const endB = new Date(b.ngay_ket_thuc || b.ngay_bat_dau);
    endA.setHours(0, 0, 0, 0);
    endB.setHours(0, 0, 0, 0);

    const aEnded = endA < today;
    const bEnded = endB < today;

    if (aEnded !== bEnded) {
      return aEnded ? 1 : -1; // a đã kết thúc thì xuống dưới
    }

    // Cùng nhóm (cả hai đều còn hạn hoặc đều đã kết thúc): ngày kết thúc xa hơn nằm dưới
    return endA - endB;
  });

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
        <h1 className="page-title">Sự kiện hiến máu</h1>
        <p className="page-description">
          Khám phá các sự kiện hiến máu đang diễn ra
        </p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện, tổ chức, bệnh viện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <rect x="8" y="12" width="48" height="44" rx="4"/>
              <path d="M8 24h48M20 8v8M44 8v8"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              {search ? 'Không tìm thấy sự kiện nào' : 'Chưa có sự kiện nào'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          {sortedEvents.map(event => (
            <div
              key={event.id_su_kien}
              className="card"
              style={{ cursor: 'pointer', transition: 'all var(--transition-base)' }}
              onClick={() => navigate(`/donor/events/${event.id_su_kien}`)}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                    {event.ten_su_kien}
                  </h3>
                  {getStatusBadge(event)}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                      <path d="M8 2a5 5 0 00-5 5c0 3.75 5 8.33 5 8.33s5-4.58 5-8.33a5 5 0 00-5-5z"/>
                      <circle cx="8" cy="7" r="1.5"/>
                    </svg>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {event.ten_dia_diem || event.dia_chi || 'Chưa cập nhật địa điểm'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                      <rect x="2" y="3" width="12" height="11" rx="1.5"/>
                      <path d="M2 6h12M5 1v4M11 1v4"/>
                    </svg>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')} - {event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                      <path d="M13 5H3M13 8H3M13 11H3"/>
                    </svg>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {event.ten_don_vi}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                      <rect x="2" y="4" width="12" height="10" rx="1"/>
                      <path d="M8 1v2M2 8h12"/>
                    </svg>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {event.ten_benh_vien}
                    </span>
                  </div>
                </div>

                {event.so_luong_du_kien && (
                  <div style={{ 
                    padding: 'var(--spacing-sm) var(--spacing-md)', 
                    background: 'var(--primary-50)', 
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Số lượng dự kiến
                    </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
                      {event.so_luong_du_kien} người
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Events;
