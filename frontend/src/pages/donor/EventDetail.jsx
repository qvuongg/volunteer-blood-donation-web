import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setMessage('Không tìm thấy sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng ký sự kiện này?')) {
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      const response = await api.post('/registrations', { id_su_kien: parseInt(id) });
      if (response.data.success) {
        setMessage('success');
        setTimeout(() => {
          navigate('/donor/registrations');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setRegistering(false);
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

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-lg)' }}>
              {message || 'Không tìm thấy sự kiện.'}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/donor/events')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/donor/events')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại
        </button>
      </div>

      {message === 'success' && (
        <div className="alert alert-success" style={{ marginBottom: 'var(--spacing-lg)' }}>
          Đăng ký thành công! Vui lòng chờ duyệt. Đang chuyển hướng...
        </div>
      )}
      {message && message !== 'success' && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--spacing-lg)' }}>
            {event.ten_su_kien}
          </h1>

          <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
                Thông tin sự kiện
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                    Tổ chức
                  </p>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                    {event.ten_don_vi}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                    Bệnh viện
                  </p>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                    {event.ten_benh_vien}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                    Ngày bắt đầu
                  </p>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                    {formatDate(event.ngay_bat_dau)}
                  </p>
                </div>
                {event.ngay_ket_thuc && (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                      Ngày kết thúc
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                      {formatDate(event.ngay_ket_thuc)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)' }}>
                Địa điểm
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                    Tên địa điểm
                  </p>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                    {event.ten_dia_diem || 'Chưa cập nhật'}
                  </p>
                </div>
                {event.dia_chi && (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                      Địa chỉ
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                      {event.dia_chi}
                    </p>
                  </div>
                )}
                {event.so_luong_du_kien && (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                      Số lượng dự kiến
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0 }}>
                      {event.so_luong_du_kien} người
                    </p>
                  </div>
                )}
                {event.registrationCount !== undefined && (
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                      Đã đăng ký
                    </p>
                    <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-600)', margin: 0 }}>
                      {event.registrationCount} người
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingTop: 'var(--spacing-xl)', borderTop: '1px solid var(--gray-200)' }}>
            <button
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={registering || event.trang_thai !== 'da_duyet'}
            >
              {registering ? (
                <>
                  <LoadingSpinner size="small" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 5v10m5-5H5"/>
                  </svg>
                  Đăng ký hiến máu
                </>
              )}
            </button>
            {event.trang_thai !== 'da_duyet' && (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: 0, display: 'flex', alignItems: 'center' }}>
                Sự kiện này chưa được duyệt
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
