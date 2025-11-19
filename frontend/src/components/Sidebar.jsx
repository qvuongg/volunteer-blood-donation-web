import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    if (!user) return [];

    const role = user.ten_vai_tro;

    const menus = {
      'nguoi_hien': [
        { path: '/donor/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/donor/profile', label: 'Hồ sơ', icon: 'user' },
        { path: '/donor/blood-info', label: 'Thông tin máu', icon: 'droplet' },
        { path: '/donor/events', label: 'Sự kiện', icon: 'calendar' },
        { path: '/donor/registrations', label: 'Đăng ký của tôi', icon: 'list' },
        { path: '/donor/history', label: 'Lịch sử hiến máu', icon: 'history' },
        { path: '/donor/locations', label: 'Địa điểm', icon: 'location' },
      ],
      'to_chuc': [
        { path: '/organization/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/organization/events', label: 'Quản lý sự kiện', icon: 'calendar' },
        { path: '/organization/approvals', label: 'Duyệt đăng ký', icon: 'check' },
      ],
      'benh_vien': [
        { path: '/hospital/dashboard', label: 'Dashboard', icon: 'dashboard' },
      ],
      'nhom_tinh_nguyen': [
        { path: '/volunteer/dashboard', label: 'Dashboard', icon: 'dashboard' },
      ],
      'admin': [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      ],
    };

    return menus[role] || [];
  };

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="6" height="6" strokeWidth="2" strokeLinecap="round"/>
          <rect x="11" y="3" width="6" height="6" strokeWidth="2" strokeLinecap="round"/>
          <rect x="3" y="11" width="6" height="6" strokeWidth="2" strokeLinecap="round"/>
          <rect x="11" y="11" width="6" height="6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      user: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <circle cx="10" cy="7" r="4" strokeWidth="2"/>
          <path d="M3 18c0-4 3-7 7-7s7 3 7 7" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      droplet: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M10 3s-6 7-6 10a6 6 0 0012 0c0-3-6-10-6-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      calendar: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="14" height="14" rx="2" strokeWidth="2"/>
          <path d="M3 8h14M7 2v4M13 2v4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      list: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M6 6h11M6 10h11M6 14h11M3 6h.01M3 10h.01M3 14h.01" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      history: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <circle cx="10" cy="10" r="7" strokeWidth="2"/>
          <path d="M10 5v5l3 3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      location: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z" strokeWidth="2"/>
          <circle cx="10" cy="8" r="2" strokeWidth="2"/>
        </svg>
      ),
      check: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M4 10l4 4 8-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="sidebar-icon">{getIcon(item.icon)}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

