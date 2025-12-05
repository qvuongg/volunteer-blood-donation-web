import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/organizations/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data.event);
        setRegistrations(response.data.data.registrations);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi khi tải thông tin sự kiện: ' + (error.response?.data?.message || error.message));
      navigate('/organization/events');
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

  if (!event) {
    return null;
  }

  return (
    <Layout>
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{event.ten_su_kien}</h1>
          <p className="page-description">Chi tiết sự kiện hiến máu</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {event.trang_thai === 'cho_duyet' && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/organization/events/${id}/edit`)}
              >
                Sửa
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  if (window.confirm('Bạn có chắc muốn xóa sự kiện này?')) {
                    try {
                      await api.delete(`/organizations/events/${id}`);
                      alert('Xóa sự kiện thành công!');
                      navigate('/organization/events');
                    } catch (error) {
                      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
                    }
                  }
                }}
              >
                Xóa
              </button>
            </>
          )}
          <button
            className="btn btn-outline"
            onClick={() => navigate('/organization/events')}
          >
            Quay lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Tổng đăng ký
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
              {registrations?.total || 0}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Chờ duyệt
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--warning-600)' }}>
              {registrations?.pending || 0}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Đã duyệt
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--success-600)' }}>
              {registrations?.approved || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-lg)' }}>Thông tin sự kiện</h2>
          
          <div className="grid grid-cols-2" style={{ gap: 'var(--spacing-lg)' }}>
            <div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Trạng thái
                </div>
                {getStatusBadge(event.trang_thai)}
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Bệnh viện
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {event.ten_benh_vien}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Tổ chức
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {event.ten_don_vi}
                </div>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Ngày bắt đầu
                </div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {new Date(event.ngay_bat_dau).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {event.ngay_ket_thuc && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Ngày kết thúc
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {new Date(event.ngay_ket_thuc).toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}

              {event.so_luong_du_kien && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Số lượng dự kiến
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {event.so_luong_du_kien} người
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Tên địa điểm
            </div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {event.ten_dia_diem}
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
              Địa chỉ
            </div>
            <div style={{ fontSize: 'var(--font-size-base)' }}>
              {event.dia_chi}
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.dia_chi)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-block', 
                marginTop: 'var(--spacing-sm)', 
                color: 'var(--primary-600)',
                textDecoration: 'none'
              }}
            >
              Xem trên Google Maps →
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-md)' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/organization/events/${id}/registrations`)}
        >
          Xem danh sách đăng ký
        </button>
      </div>
    </Layout>
  );
};

export default EventDetail;

