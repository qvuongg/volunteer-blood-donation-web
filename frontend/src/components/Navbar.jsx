import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleName = (role, organizationName) => {
    if (!organizationName) {
      const roleNames = {
        'nguoi_hien': 'Người hiến máu',
        'to_chuc': 'Tổ chức',
        'benh_vien': 'Bệnh viện',
        'nhom_tinh_nguyen': 'Tình nguyện viên',
        'admin': 'Quản trị viên'
      };
      return roleNames[role] || role;
    }

    // Hiển thị tên cụ thể cho các role có tổ chức
    if (role === 'benh_vien') {
      return `${organizationName}`;
    } else if (role === 'to_chuc') {
      return `${organizationName}`;
    } else if (role === 'nhom_tinh_nguyen') {
      return `${organizationName}`;
    }

    const roleNames = {
      'nguoi_hien': 'Người hiến máu',
      'admin': 'Quản trị viên'
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          {user && (
            <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="navbar-brand" onClick={() => navigate('/')}>
            <div className="navbar-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2C16 2 8 10 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 10 16 2 16 2Z" />
              </svg>
            </div>
            <span className="navbar-title">Hiến Máu Đà Nẵng</span>
          </div>
        </div>

        <div className="navbar-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <NotificationBell />
              
              <div className="navbar-user">
                <div 
                  className="user-info" 
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    {user.ho_ten?.charAt(0) || 'U'}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.ho_ten}</span>
                    <span className="user-role">{getRoleName(user.ten_vai_tro, user.ten_to_chuc)}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                
                {showDropdown && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
                    <div className="dropdown-menu">
                      <button className="dropdown-item" onClick={() => {
                        setShowDropdown(false);
                        navigate(`/${user.ten_vai_tro === 'nguoi_hien' ? 'donor' : user.ten_vai_tro === 'to_chuc' ? 'organization' : user.ten_vai_tro === 'benh_vien' ? 'hospital' : user.ten_vai_tro === 'nhom_tinh_nguyen' ? 'volunteer' : 'admin'}/dashboard`);
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 3h10v10H3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                        Dashboard
                      </button>
                      <button className="dropdown-item" onClick={() => {
                        setShowDropdown(false);
                        navigate('/notifications');
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                          <path d="M12 5.33333C12 4.27247 11.5786 3.25505 10.8284 2.50491C10.0783 1.75476 9.06087 1.33333 8 1.33333C6.93913 1.33333 5.92172 1.75476 5.17157 2.50491C4.42143 3.25505 4 4.27247 4 5.33333C4 10 2 11.3333 2 11.3333H14C14 11.3333 12 10 12 5.33333Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.15335 14C9.03614 14.2021 8.86791 14.3698 8.66552 14.4864C8.46313 14.603 8.23344 14.6643 8 14.6643C7.76656 14.6643 7.53687 14.603 7.33448 14.4864C7.13209 14.3698 6.96386 14.2021 6.84665 14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Thông báo
                      </button>
                      {(user.ten_vai_tro === 'nguoi_hien' || user.ten_vai_tro === 'benh_vien') && (
                        <button className="dropdown-item" onClick={() => {
                          setShowDropdown(false);
                          navigate(`/${user.ten_vai_tro === 'nguoi_hien' ? 'donor' : 'hospital'}/profile`);
                        }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          </svg>
                          Hồ sơ
                        </button>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6 14H3V2h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-actions">
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

