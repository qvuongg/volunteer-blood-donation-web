import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventApproval = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/hospitals/events/all');
      if (response.data.success) {
        setEvents(response.data.data.events || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    if (!window.confirm('Bạn có chắc muốn phê duyệt sự kiện này?')) return;

    setProcessing(eventId);
    try {
      const response = await api.put(`/hospitals/events/${eventId}/status`, {
        trang_thai: 'da_duyet'
      });

      if (response.data.success) {
        alert('Phê duyệt sự kiện thành công!');
        fetchAllEvents(); // Refresh to show updated status
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (eventId) => {
    const reason = window.prompt('Lý do từ chối:');
    if (!reason) return;

    setProcessing(eventId);
    try {
      const response = await api.put(`/hospitals/events/${eventId}/status`, {
        trang_thai: 'tu_choi',
        ly_do: reason
      });

      if (response.data.success) {
        alert('Đã từ chối sự kiện.');
        fetchAllEvents(); // Refresh to show updated status
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setProcessing(null);
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
        <h1 className="page-title">Phê duyệt sự kiện</h1>
        <p className="page-description">
          Danh sách tất cả sự kiện hiến máu (chờ duyệt, đã duyệt, đã từ chối)
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="var(--gray-400)" strokeWidth="2" style={{ margin: '0 auto var(--spacing-lg)' }}>
              <path d="M16 8h32M16 56h32M48 8v48M16 8v48M24 20h16M24 32h16M24 44h16"/>
            </svg>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Không có sự kiện nào
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {events.map(event => {
            const getStatusBadge = (trang_thai) => {
              switch (trang_thai) {
                case 'cho_duyet':
                  return <span className="badge badge-warning">Chờ duyệt</span>;
                case 'da_duyet':
                  return <span className="badge badge-success">Đã duyệt</span>;
                case 'tu_choi':
                  return <span className="badge badge-danger">Đã từ chối</span>;
                default:
                  return <span className="badge badge-secondary">{trang_thai}</span>;
              }
            };

            return (
            <div key={event.id_su_kien} className="card">
              <div className="card-header">
                <h3 className="card-title">{event.ten_su_kien}</h3>
                {getStatusBadge(event.trang_thai)}
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block' }}>
                        Tổ chức
                      </label>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-medium)' }}>
                        {event.ten_don_vi}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block' }}>
                        Thời gian
                      </label>
                      <p style={{ margin: '4px 0 0 0' }}>
                        {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN')} - {new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block' }}>
                        Số lượng dự kiến
                      </label>
                      <p style={{ margin: '4px 0 0 0', fontWeight: 'var(--font-weight-medium)' }}>
                        {event.so_luong_du_kien} người
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {event.ten_dia_diem && (
                      <div>
                        <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', display: 'block' }}>
                          Địa điểm
                        </label>
                        <p style={{ margin: '4px 0 0 0' }}>
                          {event.ten_dia_diem}
                        </p>
                        {event.dia_chi && (
                          <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {event.dia_chi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {event.trang_thai === 'cho_duyet' && (
                  <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(event.id_su_kien)}
                      disabled={processing === event.id_su_kien}
                    >
                      {processing === event.id_su_kien ? (
                        <>
                          <LoadingSpinner size="small" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 9l2 2 4-4"/>
                          </svg>
                          Phê duyệt
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(event.id_su_kien)}
                      disabled={processing === event.id_su_kien}
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default EventApproval;

