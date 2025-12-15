import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import HomeHeader from '../components/HomeHeader';
import HomeFooter from '../components/HomeFooter';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('vi');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const handlePrimaryCta = () => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate('/donor/events');
    } else {
      navigate('/register');
    }
  };

  const handleFindDrive = () => {
    const q = searchQuery.trim();
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      navigate(q ? `/donor/events?search=${encodeURIComponent(q)}` : '/donor/events');
    } else {
      // Navigate to public events page for non-logged-in users
      navigate(q ? `/events?search=${encodeURIComponent(q)}` : '/events');
    }
  };

  useEffect(() => {
    if (user && user.ten_vai_tro === 'nguoi_hien') {
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await api.get('/events/upcoming/list?limit=3');
      if (response.data.success) {
        setUpcomingEvents(response.data.data.events);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Nếu đã đăng nhập với role khác ngoài người hiến máu, redirect về dashboard tương ứng
  if (user && user.ten_vai_tro !== 'nguoi_hien') {
    const roleRoutes = {
      'to_chuc': '/organization/dashboard',
      'benh_vien': '/hospital/dashboard',
      'nhom_tinh_nguyen': '/volunteer/dashboard',
      'admin': '/admin/dashboard'
    };
    const route = roleRoutes[user.ten_vai_tro];
    if (route) {
      navigate(route);
      return null;
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
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

      {/* Hero (image background + overlay text) */}
      <div style={{
        position: 'relative',
        height: 'clamp(520px, 72vh, 720px)',
        backgroundImage: 'url(/images/home_page.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(17,24,39,0.70) 0%, rgba(17,24,39,0.35) 55%, rgba(17,24,39,0.05) 100%)'
        }} />

        <div style={{
          position: 'relative',
          height: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 1.08,
              color: 'white',
              maxWidth: '640px',
              margin: 0,
              marginTop: '156px',
              textShadow: '0 6px 24px rgba(0,0,0,0.35)'
            }}>
              Hiến Giọt Máu Đào – Trao Đời Sự Sống
            </h1>
            <p style={{
              marginTop: '24px',
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.7,
              color: 'white',
              fontWeight: 600,
              maxWidth: '840px',
              opacity: 0.95,
              textShadow: '0 2px 12px rgba(255, 255, 255, 0.35)'
            }}>
              Mỗi lần hiến máu chỉ mất vài phút nhưng có thể cứu sống đến 3 người.
              <br />
              Hãy trở thành người hùng trong câu chuyện của ai đó.
            </p>
            <button
              onClick={handlePrimaryCta}
              style={{
                marginTop: '28px',
                padding: '14px 32px',
                border: '2px solid white',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                cursor: 'pointer',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                borderRadius: '999px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = 'white';
              }}
            >
              {user && user.ten_vai_tro === 'nguoi_hien' ? 'Xem Sự Kiện Hiến Máu' : 'Đăng Ký Hiến Máu Ngay'}
            </button>
          </div>
        </div>
      </div>

      {/* Find a Drive card - Moved below hero */}
      <div
        id="home-find-drive"
        style={{
          background: 'white',
          marginTop: '20px',
          marginBottom: '40px',
          maxWidth: '1100px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '0 var(--spacing-xl)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{
          background: 'white',
          borderRadius: '18px',
          boxShadow: '0 18px 54px rgba(0,0,0,0.18)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: '#111827', marginBottom: '6px' }}>
              Tìm sự kiện hiến máu gần bạn
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindDrive();
              }}
              placeholder="Nhập địa chỉ, quận/huyện hoặc mã vùng..."
              style={{
                border: 'none',
                outline: 'none',
                padding: 0,
                fontSize: 'var(--font-size-base)',
                color: '#111827'
              }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleFindDrive}
            style={{
              background: '#dc2626',
              borderColor: '#dc2626',
              padding: '14px 28px',
              borderRadius: '999px',
              fontWeight: 'var(--font-weight-bold)',
              whiteSpace: 'nowrap',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div 
        id="statistics"
        style={{
          background: 'white',
          marginTop: '60px',
          padding: 'var(--spacing-3xl) var(--spacing-xl)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-xl)'
        }}>
          {[
            { number: '10,000+', label: 'Người Hiến Máu', icon: '👥' },
            { number: '500+', label: 'Sự Kiện Đã Tổ Chức', icon: '📅' },
            { number: '50+', label: 'Tổ Chức Tham Gia', icon: '🏢' },
            { number: '24/7', label: 'Hỗ Trợ Khẩn Cấp', icon: '🚨' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#dc2626',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-secondary)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Section - Only for logged-in donors */}
      {user && user.ten_vai_tro === 'nguoi_hien' && (
        <div style={{
          background: 'white',
          padding: 'var(--spacing-4xl) var(--spacing-xl)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-3xl)'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: '#dc2626',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  Sự Kiện Sắp Diễn Ra
                </h2>
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--text-secondary)'
                }}>
                  Khám phá các sự kiện hiến máu sắp tới và đăng ký tham gia
                </p>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/donor/events')}
                style={{
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                Xem tất cả
              </button>
            </div>

            {loadingEvents ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>⏳</div>
                <p style={{ color: 'var(--text-secondary)' }}>Đang tải sự kiện...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: 'var(--spacing-xl)'
              }}>
                {upcomingEvents.map((event) => {
                  const startDate = new Date(event.ngay_bat_dau);
                  const endDate = new Date(event.ngay_ket_thuc);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  let status = 'Sắp diễn ra';
                  let statusColor = '#2563eb';
                  if (startDate <= today && endDate >= today) {
                    status = 'Đang diễn ra';
                    statusColor = '#16a34a';
                  }

                  return (
                    <div 
                      key={event.id_su_kien}
                      style={{
                        background: 'white',
                        border: '2px solid var(--gray-200)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                      }}
                      onClick={() => navigate(`/donor/events/${event.id_su_kien}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--gray-200)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: 'var(--font-size-xl)', 
                          fontWeight: 'var(--font-weight-bold)',
                          color: '#1f2937',
                          flex: 1,
                          marginRight: 'var(--spacing-md)'
                        }}>
                          {event.ten_su_kien}
                        </h3>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          background: `${statusColor}15`,
                          color: statusColor,
                          whiteSpace: 'nowrap'
                        }}>
                          {status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="14" height="12" rx="1"/>
                            <path d="M2 7h14M5 2v4M13 2v4"/>
                          </svg>
                          <span>
                            {startDate.toLocaleDateString('vi-VN')} - {endDate.toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 2a4 4 0 00-4 4c0 3 4 6.67 4 6.67S13 9 13 6a4 4 0 00-4-4z"/>
                            <circle cx="9" cy="6" r="1.5"/>
                          </svg>
                          <span>{event.dia_chi}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 9h4M2 12h3M2 6h5M1 15h7a1 1 0 001-1V4a1 1 0 00-1-1H1v12z"/>
                            <path d="M15 9a6 6 0 11-12 0"/>
                          </svg>
                          <span>{event.ten_benh_vien} • {event.ten_don_vi}</span>
                        </div>

                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginTop: 'var(--spacing-md)',
                          paddingTop: 'var(--spacing-md)',
                          borderTop: '1px solid var(--gray-200)'
                        }}>
                          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                            Đã đăng ký: {event.so_luong_dang_ky || 0} / {event.so_luong_du_kien}
                          </span>
                          <span style={{ fontSize: 'var(--font-size-sm)', color: '#dc2626', fontWeight: 'var(--font-weight-medium)' }}>
                            Xem chi tiết →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-4xl)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto var(--spacing-md)', color: 'var(--text-tertiary)' }}>
                  <rect x="8" y="12" width="48" height="44" rx="4"/>
                  <path d="M8 24h48M20 8v12M44 8v12"/>
                </svg>
                <p style={{ margin: '0 0 var(--spacing-md)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Chưa có sự kiện sắp diễn ra
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/donor/events')}
                >
                  Khám phá sự kiện
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Why Donate Section with Images */}
      <div 
        id="why-donate"
        style={{
          background: 'var(--gray-50)',
          padding: 'var(--spacing-5xl) var(--spacing-xl)',
          scrollMarginTop: '120px'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 'var(--font-weight-bold)',
              color: '#dc2626',
              marginBottom: 'var(--spacing-md)'
            }}>
              Tại Sao Nên Hiến Máu?
            </h2>
            <p style={{
              fontSize: 'clamp(18px, 2vw, 22px)',
              color: 'var(--text-secondary)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.7
            }}>
              Hiến máu không chỉ giúp đỡ người khác mà còn mang lại nhiều lợi ích cho chính bạn
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'var(--spacing-2xl)',
            padding: '0 var(--spacing-md)'
          }}>
            {[
              {
                title: 'Được bồi dưỡng trực tiếp',
                bullets: [
                  'Ăn nhẹ, nước uống tại chỗ: 1 trà xanh không độ, 1 chocopie 66g, 1 bánh Goute 35,5g (≈ 30.000đ).',
                  'Hỗ trợ chi phí đi lại: 50.000đ (tiền mặt).',
                  'Quà tặng tương đương: 100.000đ (250ml), 150.000đ (350ml), 180.000đ (450ml).'
                ]
              },
              {
                title: 'Được cấp Giấy chứng nhận hiến máu',
                bullets: [
                  'Nhận giấy chứng nhận mỗi lần hiến máu tình nguyện.',
                  'Được truyền máu miễn phí với số lượng đã hiến tại mọi cơ sở y tế công lập.',
                  'Xuất trình giấy chứng nhận để được miễn phí truyền máu.',
                  'Cơ sở y tế ký, đóng dấu, xác nhận số lượng máu đã truyền miễn phí.'
                ]
              },
              {
                title: 'Được tư vấn về sức khỏe',
                bullets: [
                  'Giải thích quy trình hiến máu và các tai biến có thể xảy ra.',
                  'Thông tin về dấu hiệu/triệu chứng nhiễm vi rút viêm gan, HIV và bệnh lây qua đường máu, tình dục.',
                  'Xét nghiệm sàng lọc vi rút lây qua đường máu, tình dục (HIV, Giang mai, viêm gan,...).',
                  'Tư vấn chăm sóc sức khỏe và kết quả bất thường sau hiến máu.',
                  'Bảo mật kết quả khám lâm sàng và xét nghiệm.'
                ]
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  padding: 'var(--spacing-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                  margin: 'var(--spacing-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                }}
              >
                <h3 style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: '#dc2626',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {feature.title}
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-base)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {feature.bullets.map((item, bulletIdx) => (
                    <li key={bulletIdx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blood Donation Activities */}
      <div
        style={{
          background: 'white',
          padding: 'var(--spacing-5xl) var(--spacing-xl)',
          marginTop: 'var(--spacing-3xl)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
            <h2 style={{
              fontSize: 'clamp(30px, 4vw, 50px)',
              fontWeight: 'var(--font-weight-bold)',
              color: '#dc2626',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Các Hoạt Động Hiến Máu Nhân Đạo
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-secondary)',
              maxWidth: '820px',
              margin: '0 auto',
              lineHeight: 1.7
            }}>
              Những khoảnh khắc ý nghĩa trong các chương trình hiến máu và kết nối cộng đồng.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-xl)',
            paddingLeft: 'var(--spacing-2xl)',
            paddingRight: 'var(--spacing-2xl)'
          }}>
            {[
              '/images/1.jpg',
              '/images/2.jpeg',
              '/images/3.jpeg',
              '/images/4.jpeg',
              '/images/5.jpeg',
              '/images/6.jpeg'
            ].map((img, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  background: 'white',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(220, 38, 38, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                }}
              >
                <div
                  style={{
                    height: '220px',
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eligibility Section */}
      <div
        style={{
          background: 'white',
          padding: 'var(--spacing-5xl) var(--spacing-3xl)',
          marginTop: 'var(--spacing-3xl)',
          borderTop: '1px solid var(--gray-200)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: 'var(--spacing-2xl)', alignItems: 'stretch' }}>
          {/* Left banner / title area */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-3xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 10px 26px rgba(0,0,0,0.08)',
              minHeight: 260,
              border: '1px solid #ffe0b3'
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#b91c1c',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              Tiêu Chuẩn<br />Tham Gia Hiến Máu
            </h2>
            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 'var(--font-size-base)' }}>
              Đáp ứng đủ điều kiện sức khỏe, chỉ số xét nghiệm và hành vi an toàn trước khi hiến máu.
            </p>
          </div>

          {/* Right cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}
          >
            {[
              {
                icon: '🪪',
                text: 'Mang theo chứng minh nhân dân/hộ chiếu khi đi hiến máu.'
              },
              {
                icon: '💉',
                text: 'Không nghiện ma túy, rượu bia và các chất kích thích.'
              },
              {
                icon: '🦠',
                text: 'Không mắc hoặc không có hành vi nguy cơ lây nhiễm HIV, viêm gan B, viêm gan C và các virus lây qua đường truyền máu.'
              },
              {
                icon: '⚖️',
                text: 'Cân nặng: Nam ≥ 45kg, Nữ ≥ 45kg.'
              },
              {
                icon: '❤️',
                text: 'Không mắc các bệnh mạn tính hoặc cấp tính về tim mạch, huyết áp, hô hấp, dạ dày...'
              },
              {
                icon: '🩸',
                text: 'Chỉ số huyết sắc tố (Hb) ≥ 120g/l (≥ 125g/l nếu hiến từ 350ml trở lên).'
              },
              {
                icon: '🎂',
                text: 'Người khỏe mạnh trong độ tuổi từ 18 đến 60.'
              },
              {
                icon: '📅',
                text: 'Thời gian tối thiểu giữa 2 lần hiến máu là 12 tuần cho cả Nam và Nữ.'
              },
              {
                icon: '🧪',
                text: 'Kết quả test nhanh âm tính với kháng nguyên bề mặt của siêu vi B.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-lg)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--spacing-md)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  border: '1px solid var(--gray-200)'
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    fontSize: 22,
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advice Before & After Donation */}
      <div
        style={{
          background: 'white',
          padding: 'var(--spacing-5xl) var(--spacing-3xl)',
          marginTop: 'var(--spacing-3xl)',
          borderTop: '1px solid var(--gray-200)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(30px, 4vw, 50px)',
              fontWeight: 'var(--font-weight-bold)',
              color: '#b91c1c',
              marginBottom: 'var(--spacing-4xl)'
            }}
          >
            Những Lời Khuyên Trước Và Sau Khi Hiến Máu
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--spacing-xl)'
            }}
          >
            {/* Nên */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    fontSize: 20
                  }}
                >
                  ✓
                </span>
                <h3
                  style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#111827',
                    margin: 0
                  }}
                >
                  Nên
                </h3>
              </div>
              <ul
                style={{
                  paddingLeft: 20,
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'var(--font-weight-medium)',
                  lineHeight: 1.7,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <li>Ăn nhẹ và uống nhiều nước (300–500ml) trước khi hiến máu.</li>
                <li>Đè chặt miếng bông gòn cầm máu tại vị trí kim chích 10 phút, giữ băng trong 4–6 giờ.</li>
                <li>Nằm/ngồi nghỉ tại chỗ khoảng 10 phút sau khi hiến máu.</li>
                <li>Nằm đầu thấp, kê chân cao nếu thấy chóng mặt, mệt, buồn nôn.</li>
                <li>Chườm lạnh (túi chườm chuyên dụng hoặc khăn bọc đá) nếu vùng chích sưng hoặc bầm tím.</li>
              </ul>
              <div
                style={{
                  marginTop: 'var(--spacing-lg)',
                  textAlign: 'right',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 'var(--font-weight-bold)', color: '#111827' }}>
                  Bác sĩ Ngô Văn Tân
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Trưởng khoa Khoa Tiếp nhận hiến máu.
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Bệnh viện Truyền máu Huyết học
                </div>
              </div>
            </div>

            {/* Không nên */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    fontSize: 20
                  }}
                >
                  ✕
                </span>
                <h3
                  style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#111827',
                    margin: 0
                  }}
                >
                  Không nên
                </h3>
              </div>
              <ul
                style={{
                  paddingLeft: 20,
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'var(--font-weight-medium)',
                  lineHeight: 1.7,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <li>Uống sữa, rượu bia trước khi hiến máu.</li>
                <li>Lái xe đi xa, khuân vác nặng, làm việc nặng hoặc luyện tập thể thao gắng sức trong ngày hiến máu.</li>
              </ul>
              <div
                style={{
                  marginTop: 'var(--spacing-lg)',
                  textAlign: 'right',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 'var(--font-weight-bold)', color: '#111827' }}>
                  Bác sĩ Ngô Văn Tân
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Trưởng khoa Khoa Tiếp nhận hiến máu.
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Bệnh viện Truyền máu Huyết học
                </div>
              </div>
            </div>

            {/* Lưu ý */}
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b',
                    fontSize: 20
                  }}
                >
                  !
                </span>
                <h3
                  style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#111827',
                    margin: 0
                  }}
                >
                  Lưu ý
                </h3>
              </div>
              <ul
                style={{
                  paddingLeft: 20,
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-secondary)',
                  fontWeight: 'var(--font-weight-medium)',
                  lineHeight: 1.7,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <li>Nếu thấy chảy máu tại chỗ chích: giơ tay cao và ấn nhẹ lên miếng bông/băng dính.</li>
                <li>Ăn nhẹ và uống thêm nước nếu cảm thấy mệt.</li>
                <li>Liên hệ nhân viên y tế khi có bất kỳ dấu hiệu bất thường nào.</li>
              </ul>
              <div
                style={{
                  marginTop: 'var(--spacing-lg)',
                  textAlign: 'right',
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: 1.5
                }}
              >
                <div style={{ fontWeight: 'var(--font-weight-bold)', color: '#111827' }}>
                  Bác sĩ Ngô Văn Tân
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Trưởng khoa Khoa Tiếp nhận hiến máu.
                </div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                  Bệnh viện Truyền máu Huyết học
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div 
        id="roles"
        style={{
          background: 'white',
          padding: 'var(--spacing-5xl) var(--spacing-xl)',
          scrollMarginTop: '120px',
          marginTop: 'var(--spacing-3xl)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-4xl)' }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 'var(--font-weight-bold)',
              color: '#dc2626',
              marginBottom: 'var(--spacing-md)'
            }}>
              Dành Cho Mọi Đối Tượng
            </h2>
            <p style={{
              fontSize: 'clamp(18px, 2vw, 22px)',
              color: 'var(--text-secondary)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.7
            }}>
              Nền tảng kết nối toàn diện cho tất cả các bên tham gia
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-xl)'
          }}>
            {[
              {
                title: 'Người Hiến Máu',
                desc: 'Đăng ký lịch hiến, xem lịch sử, cập nhật hồ sơ và tìm sự kiện hiến máu gần nhất.',
                icon: '🩸',
                color: '#dc2626'
              },
              {
                title: 'Tổ Chức',
                desc: 'Tạo và quản lý sự kiện hiến máu, duyệt đăng ký từ người hiến máu.',
                icon: '🏢',
                color: '#2563eb'
              },
              {
                title: 'Bệnh Viện',
                desc: 'Phê duyệt sự kiện, xác thực nhóm máu, cập nhật kết quả và gửi thông báo khẩn.',
                icon: '🏥',
                color: '#16a34a'
              },
              {
                title: 'Nhóm Tình Nguyện',
                desc: 'Nhận thông báo kêu gọi hiến máu khẩn cấp và chia sẻ thông tin đến cộng đồng.',
                icon: '🤝',
                color: '#ea580c'
              },
              {
                title: 'Quản Trị Viên',
                desc: 'Giám sát toàn hệ thống, quản lý người dùng và theo dõi thống kê tổng thể.',
                icon: '⚙️',
                color: '#7c3aed'
              }
            ].map((role, idx) => (
              <div key={idx} style={{
                background: 'white',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-2xl)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = role.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${role.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontSize: '64px',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  {role.icon}
                </div>
                <h3 style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: role.color,
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  {role.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  fontSize: 'var(--font-size-base)'
                }}>
                  {role.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section with Image */}
      <div style={{
        position: 'relative',
        height: 'clamp(450px, 50vh, 600px)',
        backgroundImage: 'url(/images/8.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--spacing-3xl) var(--spacing-xl)',
        marginTop: 'var(--spacing-3xl)',
        marginBottom: 'var(--spacing-3xl)',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%)'
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: 'white',
          maxWidth: '900px',
          padding: '0 var(--spacing-xl)'
        }}>
          <h2 style={{
            fontSize: 'clamp(36px, 4.5vw, 64px)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-lg)',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            Sẵn Sàng Tham Gia?
          </h2>
          <p style={{
            fontSize: 'clamp(18px, 2vw, 24px)',
            marginBottom: 'var(--spacing-2xl)',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            lineHeight: 1.7,
            opacity: 0.95
          }}>
            Hãy bắt đầu hành trình ý nghĩa của bạn ngay hôm nay.
            <br />
            Mỗi giọt máu đều có giá trị, mỗi hành động đều tạo nên sự khác biệt.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={handlePrimaryCta}
              style={{
                background: 'white',
                color: '#dc2626',
                padding: 'var(--spacing-lg) var(--spacing-3xl)',
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: 'none',
                borderRadius: '999px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
              }}
            >
              {user && user.ten_vai_tro === 'nguoi_hien' ? 'Xem Sự Kiện' : 'Đăng Ký Ngay'}
            </button>
            {!user && (
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/login')}
                style={{
                  borderColor: 'white',
                  color: 'white',
                  padding: 'var(--spacing-lg) var(--spacing-3xl)',
                  fontSize: 'clamp(16px, 1.8vw, 20px)',
                  fontWeight: 'var(--font-weight-bold)',
                  background: 'transparent',
                  borderRadius: '999px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Đăng Nhập
              </button>
            )}
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

export default Home;
