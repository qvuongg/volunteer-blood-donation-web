import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
            {user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
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

                {/* User Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </button>

                  {showUserDropdown && (
                    <>
                      <div 
                        onClick={() => setShowUserDropdown(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 999
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'white',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '200px',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate(`/${user.ten_vai_tro === 'nguoi_hien' ? 'donor' : user.ten_vai_tro === 'to_chuc' ? 'organization' : user.ten_vai_tro === 'benh_vien' ? 'hospital' : 'admin'}/dashboard`);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          </svg>
                          Dashboard
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/notifications');
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                            <path d="M12 5.33333C12 4.27247 11.5786 3.25505 10.8284 2.50491C10.0783 1.75476 9.06087 1.33333 8 1.33333C6.93913 1.33333 5.92172 1.75476 5.17157 2.50491C4.42143 3.25505 4 4.27247 4 5.33333C4 10 2 11.3333 2 11.3333H14C14 11.3333 12 10 12 5.33333Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.15335 14C9.03614 14.2021 8.86791 14.3698 8.66552 14.4864C8.46313 14.603 8.23344 14.6643 8 14.6643C7.76656 14.6643 7.53687 14.603 7.33448 14.4864C7.13209 14.3698 6.96386 14.2021 6.84665 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Thông báo
                        </button>

                        {(user.ten_vai_tro === 'nguoi_hien' || user.ten_vai_tro === 'benh_vien') && (
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              navigate(`/${user.ten_vai_tro === 'nguoi_hien' ? 'donor' : 'hospital'}/profile`);
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: 'none',
                              background: 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: 'var(--font-size-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                              <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            </svg>
                            Hồ sơ
                          </button>
                        )}

                        <div style={{ height: '1px', background: 'var(--gray-200)', margin: '4px 0' }} />

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            logout();
                            navigate('/');
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--danger-600)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-50)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M6 14H3V2h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
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
              </>
            )}

            
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
