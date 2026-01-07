import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';

const PublicEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');

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
    } finally {
      setLoading(false);
    }
  };

  const handleFindDrive = () => {
    const q = searchQuery.trim();
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate(q ? `/donor/events?search=${encodeURIComponent(q)}` : '/donor/events');
    } else {
      navigate(q ? `/events?search=${encodeURIComponent(q)}` : '/events');
    }
  };

  const handlePrimaryCta = () => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate('/donor/events');
    } else {
      navigate('/register');
    }
  };

  const handleRegister = () => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      // Nếu đã đăng nhập là người hiến máu, đi đến trang đăng ký
      navigate(`/donor/events/${id}/register`);
    } else {
      // Chưa đăng nhập hoặc không phải người hiến máu, đi đến trang đăng nhập
      navigate(`/login?returnUrl=/donor/events/${id}/register`);
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

  const isEventEnded = (evt) => {
    if (!evt) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(evt.ngay_ket_thuc || evt.ngay_bat_dau);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  };

  const getStatusBadge = () => {
    if (!event) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(event.ngay_bat_dau);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(event.ngay_ket_thuc || event.ngay_bat_dau);
    endDate.setHours(0, 0, 0, 0);

    if (event.trang_thai !== 'da_duyet') {
      return <span className="badge badge-secondary">Chưa được duyệt</span>;
    }

    if (startDate > today) {
      return <span className="badge badge-primary">Sắp diễn ra</span>;
    } else if (endDate < today) {
      return <span className="badge badge-secondary">Đã kết thúc</span>;
    } else {
      return <span className="badge badge-success">Đang diễn ra</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HomeHeader
          user={user}
          logout={logout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          handleFindDrive={handleFindDrive}
          handlePrimaryCta={handlePrimaryCta}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
        <HomeFooter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleFindDrive={handleFindDrive}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HomeHeader
          user={user}
          logout={logout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          language={language}
          setLanguage={setLanguage}
          handleFindDrive={handleFindDrive}
          handlePrimaryCta={handlePrimaryCta}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-lg)' }}>
              Không tìm thấy sự kiện.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Quay lại danh sách
            </button>
          </div>
        </div>
        <HomeFooter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleFindDrive={handleFindDrive}
        />
      </div>
    );
  }

  const canRegister = event.trang_thai === 'da_duyet' && !isEventEnded(event);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HomeHeader
        user={user}
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        language={language}
        setLanguage={setLanguage}
        handleFindDrive={handleFindDrive}
        handlePrimaryCta={handlePrimaryCta}
      />

      <div style={{ flex: 1, padding: 'var(--spacing-4xl) var(--spacing-xl)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back button */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => navigate('/events')}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại danh sách
            </button>
          </div>

          {/* Event Card */}
          <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: 'var(--font-size-3xl)', margin: 0, flex: 1 }}>
                  {event.ten_su_kien}
                </h1>
                <div style={{ marginLeft: 'var(--spacing-md)' }}>
                  {getStatusBadge()}
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ marginBottom: 'var(--spacing-xl)', gap: 'var(--spacing-xl)' }}>
                {/* Left Column - Event Info */}
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)', fontWeight: 'var(--font-weight-semibold)' }}>
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

                {/* Right Column - Location */}
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-md)', fontWeight: 'var(--font-weight-semibold)' }}>
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
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                          {event.dia_chi}
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.dia_chi)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M8 2a5 5 0 00-5 5c0 3.75 5 8.33 5 8.33s5-4.58 5-8.33a5 5 0 00-5-5z" />
                            <circle cx="8" cy="7" r="1.5" />
                          </svg>
                          Xem trên Google Maps
                        </a>
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
                    {event.so_luong_dang_ky !== undefined && (
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)', margin: '0 0 4px' }}>
                          Đã đăng ký
                        </p>
                        <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--primary-600)', margin: 0 }}>
                          {event.so_luong_dang_ky || 0} người
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: 'var(--spacing-md)', 
                paddingTop: 'var(--spacing-xl)', 
                borderTop: '1px solid var(--gray-200)',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {canRegister ? (
                  <>
                    {user && user.ten_vai_tro === 'nguoi_hien' ? (
                      <button
                        className="btn btn-primary"
                        onClick={handleRegister}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: 'var(--spacing-xs)' }}>
                          <path d="M10 5v10m5-5H5"/>
                        </svg>
                        Đăng ký hiến máu
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleRegister}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: 'var(--spacing-xs)' }}>
                          <path d="M10 5v10m5-5H5"/>
                        </svg>
                        {user ? 'Đăng nhập với tài khoản người hiến máu để đăng ký' : 'Đăng nhập để đăng ký'}
                      </button>
                    )}
                    {!user && (
                      <button
                        className="btn btn-outline"
                        onClick={() => navigate('/register')}
                      >
                        Chưa có tài khoản? Đăng ký ngay
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    background: 'var(--gray-50)', 
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)'
                  }}>
                    {isEventEnded(event) ? (
                      <p style={{ margin: 0 }}>Sự kiện này đã kết thúc, không thể đăng ký.</p>
                    ) : (
                      <p style={{ margin: 0 }}>Sự kiện này chưa được duyệt, vui lòng quay lại sau.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeFooter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleFindDrive={handleFindDrive}
      />
    </div>
  );
};

export default PublicEventDetail;


