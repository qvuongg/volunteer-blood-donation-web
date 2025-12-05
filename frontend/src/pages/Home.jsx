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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div style={{ 
        padding: 'var(--spacing-3xl) var(--spacing-xl)', 
        maxWidth: '1200px', 
        margin: '0 auto',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto var(--spacing-lg)',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="white">
              <path d="M24 4C24 4 12 16 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 16 24 4 24 4Z" />
            </svg>
          </div>
          <h1 style={{ 
            fontSize: 'var(--font-size-4xl)', 
            fontWeight: 'var(--font-weight-bold)', 
            marginBottom: 'var(--spacing-md)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Hiến giọt máu đào - Trao đời sự sống
          </h1>
          <p style={{ 
            fontSize: 'var(--font-size-xl)', 
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto var(--spacing-xl)',
            lineHeight: 1.6
          }}>
            Hệ thống quản lý hiến máu tình nguyện Đà Nẵng - Kết nối người hiến máu, 
            tổ chức, bệnh viện và nhóm tình nguyện trên một nền tảng thống nhất
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginBottom: 'var(--spacing-3xl)' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/register')}
              style={{ 
                background: 'white', 
                color: '#667eea',
                padding: 'var(--spacing-md) var(--spacing-xl)',
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)'
              }}
            >
              Đăng ký ngay
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/login')}
              style={{ 
                borderColor: 'white',
                color: 'white',
                padding: 'var(--spacing-md) var(--spacing-xl)',
                fontSize: 'var(--font-size-lg)'
              }}
            >
            Đăng nhập
          </button>
          </div>
        </div>

        {/* Statistics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-3xl)'
        }}>
          {[
            { number: '10,000+', label: 'Người hiến máu' },
            { number: '500+', label: 'Sự kiện đã tổ chức' },
            { number: '50+', label: 'Tổ chức tham gia' },
            { number: '24/7', label: 'Hỗ trợ khẩn cấp' }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255,255,255,0.15)', 
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)' }}>
                {stat.number}
              </div>
              <div style={{ opacity: 0.9 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'white', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--text-primary)'
          }}>
            Tại sao nên hiến máu?
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontSize: 'var(--font-size-lg)'
          }}>
            Mỗi lần hiến máu, bạn có thể cứu sống đến 3 người
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
            {[
              {
                icon: '❤️',
                title: 'Cứu sống người khác',
                desc: 'Mỗi đơn vị máu bạn hiến có thể cứu sống 3 người. Đây là món quà vô giá nhất bạn có thể trao tặng.'
              },
              {
                icon: '🏥',
                title: 'Kiểm tra sức khỏe miễn phí',
                desc: 'Mỗi lần hiến máu, bạn được kiểm tra sức khỏe tổng quát và xét nghiệm máu miễn phí.'
              },
              {
                icon: '🩸',
                title: 'Tốt cho sức khỏe',
                desc: 'Hiến máu giúp giảm nguy cơ mắc bệnh tim mạch, kích thích tạo hồng cầu mới.'
              },
              {
                icon: '🤝',
                title: 'Kết nối cộng đồng',
                desc: 'Tham gia vào cộng đồng tình nguyện, lan tỏa yêu thương và giá trị nhân văn.'
              },
              {
                icon: '📱',
                title: 'Quản lý dễ dàng',
                desc: 'Theo dõi lịch sử hiến máu, nhận thông báo sự kiện và quản lý hồ sơ trực tuyến.'
              },
              {
                icon: '🎖️',
                title: 'Ghi nhận đóng góp',
                desc: 'Nhận chứng nhận và huy hiệu vinh danh cho những đóng góp của bạn.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card" style={{ height: '100%' }}>
                <div className="card-body">
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div style={{ background: 'var(--gray-50)', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--text-primary)'
          }}>
            Dành cho mọi đối tượng
          </h2>
          <p style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)', 
            marginBottom: 'var(--spacing-3xl)',
            fontSize: 'var(--font-size-lg)'
          }}>
            Nền tảng kết nối toàn diện cho tất cả các bên tham gia
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
            {[
              {
                title: 'Người hiến máu',
                desc: 'Đăng ký lịch hiến, xem lịch sử, cập nhật hồ sơ và tìm sự kiện hiến máu gần nhất.',
                icon: '👤'
              },
              {
                title: 'Tổ chức',
                desc: 'Tạo và quản lý sự kiện hiến máu, duyệt đăng ký từ người hiến máu.',
                icon: '🏢'
              },
              {
                title: 'Bệnh viện',
                desc: 'Phê duyệt sự kiện, xác thực nhóm máu, cập nhật kết quả và gửi thông báo khẩn.',
                icon: '🏥'
              },
              {
                title: 'Nhóm tình nguyện',
                desc: 'Nhận thông báo kêu gọi hiến máu khẩn cấp và chia sẻ thông tin đến cộng đồng.',
                icon: '🤝'
              },
              {
                title: 'Quản trị viên',
                desc: 'Giám sát toàn hệ thống, quản lý người dùng và theo dõi thống kê tổng thể.',
                icon: '⚙️'
              }
            ].map((role, idx) => (
              <div key={idx} className="card" style={{ textAlign: 'center', height: '100%' }}>
                <div className="card-body">
                  <div style={{ fontSize: '56px', marginBottom: 'var(--spacing-md)' }}>{role.icon}</div>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                    {role.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {role.desc}
                  </p>
                </div>
          </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 'var(--spacing-3xl) var(--spacing-xl)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-md)'
          }}>
            Sẵn sàng tham gia?
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-lg)', 
            opacity: 0.9,
            marginBottom: 'var(--spacing-xl)',
            lineHeight: 1.6
          }}>
            Hãy bắt đầu hành trình ý nghĩa của bạn ngay hôm nay. 
            Mỗi giọt máu đều có giá trị, mỗi hành động đều tạo nên sự khác biệt.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/register')}
            style={{ 
              background: 'white', 
              color: '#667eea',
              padding: 'var(--spacing-md) var(--spacing-2xl)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)'
            }}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#2d3748', color: 'white', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ opacity: 0.8 }}>
          © 2025 Hệ thống quản lý hiến máu tình nguyện Đà Nẵng. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Home;
