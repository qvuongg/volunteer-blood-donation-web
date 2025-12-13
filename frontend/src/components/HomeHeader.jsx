import { useNavigate } from 'react-router-dom';

const HomeHeader = ({ 
  user, 
  logout, 
  searchQuery, 
  setSearchQuery, 
  language, 
  setLanguage, 
  handleFindDrive, 
  handlePrimaryCta 
}) => {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'relative',
      background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderBottom: '1px solid rgba(17, 24, 39, 0.08)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px var(--spacing-xl) 8px' }}>
        {/* Top row: location pill - logo - actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--spacing-lg)'
        }}>
          {/* Location pill (like OneBlood) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid rgba(17, 24, 39, 0.12)',
            background: 'white',
            borderRadius: '999px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            minWidth: '280px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              flex: 1
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFindDrive();
                }}
                placeholder="Nhập quận/huyện hoặc mã vùng..."
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: '#111827'
                }}
              />
            </div>
            <button
              onClick={handleFindDrive}
              style={{
                border: 'none',
                background: 'rgba(17, 24, 39, 0.04)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#111827',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.04)'; }}
            >
              Tìm sự kiện
            </button>
          </div>

          {/* Logo center */}
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Trang chủ"
          >
            <svg width="36" height="36" viewBox="0 0 48 48" fill="#dc2626">
              <path d="M24 4C24 4 12 16 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 16 24 4 24 4Z" />
            </svg>
            <span style={{
              fontSize: '18px',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '0.2px',
              color: '#111827'
            }}>
              Hiến Máu Đà Nẵng
            </span>
          </button>

          {/* Actions right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {user && user.ten_vai_tro === 'nguoi_hien' ? (
              <>
                <button
                  onClick={() => navigate('/donor/dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#111827'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '999px',
                    background: '#dc2626',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    {user.ho_ten?.charAt(0)}
                  </span>
                  <span>{user.ho_ten || 'Tài khoản'}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  style={{
                    border: '1px solid rgba(17, 24, 39, 0.14)',
                    background: 'white',
                    borderRadius: '999px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#111827'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#111827'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => window.open('https://careers.example.com', '_blank')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: '#111827'
                  }}
                >
                  Tuyển dụng
                </button>
              </>
            )}

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(17, 24, 39, 0.14)',
                background: 'white',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)'
              }}
              aria-label="Chọn ngôn ngữ"
            >
              <option value="vi">VN</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>

        {/* Bottom row: menu items */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '22px',
          padding: '10px 0 6px',
          marginTop: '6px'
        }}>
          {[
            { label: 'Hiến Máu', onClick: handlePrimaryCta, id: 'hero' },
            { label: 'Vì Sao Hiến Máu', onClick: () => {
              const el = document.getElementById('why-donate');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, id: 'why-donate' },
            { label: 'Tham Gia', onClick: () => navigate('/register') },
            { label: 'Tác Động', onClick: () => {
              const el = document.getElementById('statistics');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, id: 'statistics' },
            { label: 'Đối Tượng', onClick: () => {
              const el = document.getElementById('roles');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, id: 'roles' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: '#111827',
                padding: '6px 4px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default HomeHeader;
