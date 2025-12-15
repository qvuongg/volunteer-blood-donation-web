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
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data.event);
        // Sau khi có thông tin sự kiện, kiểm tra xem user đã đăng ký chưa
        fetchRegistrationStatus(response.data.data.event.id_su_kien);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async (eventId) => {
    try {
      const response = await api.get('/registrations/my');
      if (response.data.success) {
        const registrations = response.data.data.registrations || [];
        const alreadyRegistered = registrations.some((reg) => reg.id_su_kien === Number(eventId));
        setIsRegistered(alreadyRegistered);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = () => {
    // Navigate to registration form instead of direct API call
    navigate(`/donor/events/${id}/register`);
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

  const isEventEnded = (evt) => {
    if (!evt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(evt.ngay_ket_thuc || evt.ngay_bat_dau);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  };

  const canRegister = event && event.trang_thai === 'da_duyet' && !isEventEnded(event) && !isRegistered;

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
              Không tìm thấy sự kiện.
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
                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.dia_chi)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginRight: 'var(--spacing-xs)' }}
                        >
                          <path d="M8 2a5 5 0 00-5 5c0 3.75 5 8.33 5 8.33s5-4.58 5-8.33a5 5 0 00-5-5z" />
                          <circle cx="8" cy="7" r="1.5" />
                        </svg>
                        Xem trên Google Maps
                      </a>
                    </div>
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
              disabled={!canRegister}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5v10m5-5H5"/>
              </svg>
              {isRegistered ? 'Xem chi tiết đăng ký' : 'Đăng ký hiến máu'}
          </button>
            {isRegistered && (
              <p style={{ color: 'var(--primary-600)', fontSize: 'var(--font-size-sm)', margin: 0, display: 'flex', alignItems: 'center' }}>
                Bạn đã đăng ký sự kiện này.
              </p>
            )}
            {!isRegistered && isEventEnded(event) && (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', margin: 0, display: 'flex', alignItems: 'center' }}>
                Sự kiện này đã kết thúc, không thể đăng ký.
              </p>
            )}
          </div>
        </div>
    </div>
    </Layout>
  );
};

export default EventDetail;
