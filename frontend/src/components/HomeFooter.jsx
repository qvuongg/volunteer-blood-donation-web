import { useNavigate } from 'react-router-dom';

const HomeFooter = ({ searchQuery, setSearchQuery, handleFindDrive }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: '#1f2937',
      color: 'white',
      padding: 0,
      position: 'relative'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 50px 0px 50px' }}>
        {/* Top Navigation Row with Icons */}
        <div style={{
          display: 'flex',
          justifyContent: 'left',
          gap: '165px',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: '📍', label: 'Tìm Sự Kiện', onClick: () => {
              const el = document.getElementById('home-find-drive');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }},
            { icon: '🏥', label: 'Địa Điểm', onClick: () => navigate('/register') },
            { icon: '💼', label: 'Tuyển Dụng', onClick: () => window.open('https://careers.example.com', '_blank') },
            { icon: '📞', label: 'Liên Hệ', onClick: () => {
              const el = document.getElementById('footer-contact');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-semibold)',
                padding: '2px 0',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          marginBottom: '24px'
        }} />

        {/* Main Footer Links - Multi-column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Column 1: Về Chúng Tôi */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '12px',
              color: 'white'
            }}>
              Về Chúng Tôi
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)'
            }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Chúng Tôi Là Ai</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Tuyển Dụng</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Sứ Mệnh & Giá Trị</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Quyền Lợi Người Hiến Máu</a>
            </div>
          </div>

          {/* Column 2: Dịch Vụ */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '12px',
              color: 'white'
            }}>
              Dịch Vụ
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)'
            }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('home-find-drive');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Tìm Sự Kiện</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Địa Điểm</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Đối Tác</a>
            </div>
          </div>

          {/* Column 3: Dịch Vụ Đặc Biệt */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '12px',
              color: 'white'
            }}>
              Dịch Vụ Đặc Biệt
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)'
            }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Hiến Máu Tự Thân</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Hiến Máu Chỉ Định</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Giáo Dục Y Tế</a>
            </div>
          </div>

          {/* Column 4: Tài Nguyên */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '12px',
              color: 'white'
            }}>
              Tài Nguyên
            </h4>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '16px'
            }}>
              <a href="#" id="footer-contact" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Liên Hệ</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Câu Hỏi Thường Gặp</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >Blog</a>
            </div>
            <div>
              <h5 style={{
                fontSize: '13px',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: '8px',
                color: 'white'
              }}>
                Truyền Thông
              </h5>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.85)'
              }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                >Video</a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                >Thông Cáo Báo Chí</a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
                >Logo & Hình Ảnh</a>
              </div>
            </div>
          </div>

          {/* Column 5: Chia Sẻ Sức Mạnh - Social Media */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '12px',
              color: 'white'
            }}>
              Chia Sẻ Sức Mạnh!
            </h4>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px'
            }}>
              {[
                { name: 'Facebook', icon: 'f', url: 'https://facebook.com' },
                { name: 'Instagram', icon: '📷', url: 'https://instagram.com' },
                { name: 'X (Twitter)', icon: '✕', url: 'https://twitter.com' },
                { name: 'YouTube', icon: '▶', url: 'https://youtube.com' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  }}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.15)',
          marginBottom: '16px'
        }} />

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.85)',
          paddingBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="#dc2626">
                <path d="M24 4C24 4 12 16 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 16 24 4 24 4Z" />
              </svg>
              <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'white', fontSize: '13px' }}>
                Hiến Máu Đà Nẵng
              </span>
            </div>
            <span style={{ fontSize: '13px' }}>📞 1900-xxxx</span>
          </div>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >Chính Sách Bảo Mật</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
            >Chuyên Gia Y Tế</a>
            <span>©2025 Hiến Máu Đà Nẵng</span>
          </div>
        </div>
      </div>

      {/* Live Chat Button - Fixed at bottom right */}
      <button
        onClick={() => {
          // Handle live chat
          alert('Tính năng Live Chat đang được phát triển');
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#dc2626',
          border: 'none',
          borderRadius: '999px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white',
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-bold)',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)',
          zIndex: 1000,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b91c1c';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#dc2626';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.4)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <span>Live Chat</span>
      </button>
    </div>
  );
};

export default HomeFooter;
