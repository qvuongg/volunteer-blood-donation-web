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

  const getEventStatusBadge = (event) => {
    if (event.trang_thai !== 'da_duyet') {
      return null; // Chỉ hiển thị trạng thái diễn ra cho sự kiện đã duyệt
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = event.ngay_ket_thuc ? new Date(event.ngay_ket_thuc) : null;
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    if (endDate && today > endDate) {
      return <span className="badge badge-gray">Đã kết thúc</span>;
    } else if (today >= startDate && (!endDate || today <= endDate)) {
      return <span className="badge badge-success">Đang diễn ra</span>;
    } else {
      return <span className="badge badge-info">Sắp diễn ra</span>;
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sự kiện "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/organizations/events/${id}`);
      alert('Xóa sự kiện thành công!');
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'flex-end' }}>
                    {getStatusBadge(event.trang_thai)}
                    {getEventStatusBadge(event)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Bệnh viện:</strong> {event.ten_benh_vien}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Ngày:</strong> {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')}
                    {event.ngay_ket_thuc && ` - ${new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN')}`}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    <strong>Địa điểm:</strong> {event.ten_dia_diem}
                  </div>
                  {event.so_luong_du_kien && (
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      <strong>Số lượng dự kiến:</strong> {event.so_luong_du_kien} người
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/organization/events/${event.id_su_kien}`)}
                  >
                    Chi tiết
                  </button>
                </div>
                {event.trang_thai === 'cho_duyet' && (
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/organization/events/${event.id_su_kien}/edit`)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ flex: 1 }}
                      onClick={() => handleDelete(event.id_su_kien, event.ten_su_kien)}
                    >
                      Xóa
                    </button>
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
