import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Nếu đã đăng nhập, redirect về dashboard tương ứng
  if (user) {
    const roleRoutes = {
      'nguoi_hien': '/donor/dashboard',
      'to_chuc': '/organization/dashboard',
      'benh_vien': '/hospital/dashboard',
      'nhom_tinh_nguyen': '/volunteer/dashboard',
      'admin': '/admin/dashboard'
    };
    const route = roleRoutes[user.ten_vai_tro] || '/';
    if (route !== '/') {
      navigate(route);
      return null;
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: 'var(--spacing-md) var(--spacing-xl)',
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="#dc2626">
              <path d="M24 4C24 4 12 16 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 16 24 4 24 4Z" />
            </svg>
            <span style={{ 
              fontSize: 'var(--font-size-xl)', 
              fontWeight: 'var(--font-weight-bold)',
              color: '#dc2626'
            }}>
              Hiến Máu Đà Nẵng
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/login')}
              style={{ 
                borderColor: '#dc2626', 
                color: '#dc2626',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'all 0.2s ease'
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
              Đăng nhập
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/register')}
              style={{ 
                background: '#dc2626', 
                borderColor: '#dc2626',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--font-weight-medium)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Text + CTA then Image */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        marginTop: '72px',
        padding: 'var(--spacing-5xl) var(--spacing-xl) var(--spacing-4xl)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '0 var(--spacing-xl)'
        }}>
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 68px)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-xl)',
            textShadow: '0 4px 16px rgba(0,0,0,0.3)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em'
          }}>
            Hiến Giọt Máu Đào – Trao Đời Sự Sống
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            marginBottom: 'var(--spacing-2xl)',
            lineHeight: 1.7,
            opacity: 0.96,
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
            maxWidth: '750px',
            margin: '0 auto var(--spacing-2xl)'
          }}>
            Mỗi lần hiến máu chỉ mất vài phút nhưng có thể cứu sống đến 3 người.
            <br />
            Hãy trở thành người hùng trong câu chuyện của ai đó.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/register')}
            style={{
              background: 'white',
              color: '#dc2626',
              padding: 'var(--spacing-lg) var(--spacing-3xl)',
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 'var(--font-weight-bold)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
            }}
          >
            Đăng Ký Hiến Máu Ngay
          </button>
        </div>
      </div>

      {/* Hero Image */}
      <div style={{
        position: 'relative',
        height: 'clamp(400px, 55vh, 600px)',
        backgroundImage: 'url(/images/home_page.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.25)',
        borderBottom: '4px solid #dc2626'
      }} />

      {/* Statistics Bar */}
      <div style={{
        background: 'white',
        padding: 'var(--spacing-2xl) var(--spacing-xl)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.1)'
      }}>
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

      {/* Why Donate Section with Images */}
      <div style={{
        background: 'var(--gray-50)',
        padding: 'var(--spacing-4xl) var(--spacing-xl)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: '#dc2626',
            marginBottom: 'var(--spacing-md)'
          }}>
            Tại Sao Nên Hiến Máu?
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-3xl)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-3xl)'
          }}>
            Hiến máu không chỉ giúp đỡ người khác mà còn mang lại nhiều lợi ích cho chính bạn
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'var(--spacing-2xl)'
          }}>
            {[
              {
                image: '/images/2.jpeg',
                title: 'Cứu Sống Người Khác',
                desc: 'Mỗi đơn vị máu có thể cứu sống đến 3 người. Đây là món quà vô giá nhất bạn có thể trao tặng cho cộng đồng.'
              },
              {
                image: '/images/3.jpeg',
                title: 'Kiểm Tra Sức Khỏe Miễn Phí',
                desc: 'Được kiểm tra sức khỏe tổng quát và xét nghiệm máu miễn phí mỗi lần hiến máu, giúp phát hiện sớm các vấn đề sức khỏe.'
              },
              {
                image: '/images/4.jpeg',
                title: 'Tốt Cho Sức Khỏe',
                desc: 'Hiến máu giúp giảm nguy cơ mắc bệnh tim mạch, kích thích tạo hồng cầu mới và cải thiện tuần hoàn máu.'
              },
              {
                image: '/images/5.jpeg',
                title: 'Kết Nối Cộng Đồng',
                desc: 'Tham gia vào cộng đồng tình nguyện ý nghĩa, lan tỏa yêu thương và giá trị nhân văn đến mọi người xung quanh.'
              },
              {
                image: '/images/6.jpeg',
                title: 'Quản Lý Dễ Dàng',
                desc: 'Theo dõi lịch sử hiến máu, nhận thông báo sự kiện và quản lý hồ sơ sức khỏe trực tuyến một cách tiện lợi.'
              },
              {
                image: '/images/7.jpeg',
                title: 'Ghi Nhận Đóng Góp',
                desc: 'Nhận chứng nhận và huy hiệu vinh danh cho những đóng góp cao cả của bạn cho cộng đồng và xã hội.'
              }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              }}>
                <div style={{
                  height: '240px',
                  backgroundImage: `url(${feature.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ padding: 'var(--spacing-xl)' }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#dc2626',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    fontSize: 'var(--font-size-base)'
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div style={{
        background: 'white',
        padding: 'var(--spacing-4xl) var(--spacing-xl)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: '#dc2626',
            marginBottom: 'var(--spacing-md)'
          }}>
            Dành Cho Mọi Đối Tượng
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-3xl)',
            maxWidth: '800px',
            margin: '0 auto var(--spacing-3xl)'
          }}>
            Nền tảng kết nối toàn diện cho tất cả các bên tham gia
          </p>

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
        height: '500px',
        backgroundImage: 'url(/images/8.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
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
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-lg)',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            Sẵn Sàng Tham Gia?
          </h2>
          <p style={{
            fontSize: 'var(--font-size-xl)',
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
              onClick={() => navigate('/register')}
              style={{
                background: 'white',
                color: '#dc2626',
                padding: 'var(--spacing-lg) var(--spacing-3xl)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: 'none'
              }}
            >
              Đăng Ký Ngay
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/login')}
              style={{
                borderColor: 'white',
                color: 'white',
                padding: 'var(--spacing-lg) var(--spacing-3xl)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                background: 'transparent'
              }}
            >
              Đăng Nhập
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: '#1f2937',
        color: 'white',
        padding: 'var(--spacing-3xl) var(--spacing-xl)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-2xl)',
            marginBottom: 'var(--spacing-2xl)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <svg width="32" height="32" viewBox="0 0 48 48" fill="#dc2626">
                  <path d="M24 4C24 4 12 16 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 16 24 4 24 4Z" />
                </svg>
                <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Hiến Máu Đà Nẵng
                </span>
              </div>
              <p style={{ opacity: 0.8, lineHeight: 1.7 }}>
                Hệ thống quản lý hiến máu tình nguyện, kết nối cộng đồng và lan tỏa yêu thương.
              </p>
            </div>
            
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 'var(--font-weight-bold)' }}>
                Liên Hệ
              </h4>
              <div style={{ opacity: 0.8, lineHeight: 2 }}>
                <p>📍 Đà Nẵng, Việt Nam</p>
                <p>📞 1900 xxxx</p>
                <p>✉️ contact@hienmaudn.vn</p>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: 'var(--spacing-md)', fontWeight: 'var(--font-weight-bold)' }}>
                Liên Kết
              </h4>
              <div style={{ opacity: 0.8, lineHeight: 2 }}>
                <p style={{ cursor: 'pointer' }} onClick={() => navigate('/register')}>Đăng ký</p>
                <p style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Đăng nhập</p>
                <p>Về chúng tôi</p>
                <p>Liên hệ</p>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 'var(--spacing-xl)',
            textAlign: 'center',
            opacity: 0.8
          }}>
            <p>© 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
