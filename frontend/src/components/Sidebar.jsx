import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuConfig = {
  nguoi_hien: [
    {
      title: 'Tổng quan',
      items: [{ path: '/donor/dashboard', label: 'Bảng điều khiển', icon: 'dashboard' }]
    },
    {
      title: 'Thông tin cá nhân',
      items: [
        { path: '/donor/profile', label: 'Hồ sơ', icon: 'user' },
        { path: '/donor/blood-info', label: 'Thông tin máu', icon: 'droplet' }
      ]
    },
    {
      title: 'Hoạt động',
      items: [
        { path: '/donor/events', label: 'Sự kiện', icon: 'calendar' },
        { path: '/donor/registrations', label: 'Đăng ký của tôi', icon: 'list' },
        { path: '/donor/history', label: 'Lịch sử hiến máu', icon: 'history' },
        { path: '/donor/locations', label: 'Địa điểm', icon: 'location' }
      ]
    }
  ],
  to_chuc: [
    {
      title: 'Quản lý tổ chức',
      items: [
        { path: '/organization/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/organization/events', label: 'Quản lý sự kiện', icon: 'calendar' },
        { path: '/organization/registrations', label: 'Danh sách đăng ký', icon: 'list' }
      ]
    }
  ],
  benh_vien: [
    {
      title: 'Tổng quan',
      items: [
        { path: '/hospital/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/hospital/profile', label: 'Hồ sơ', icon: 'user' }
      ]
    },
    {
      title: 'Phê duyệt',
      items: [
        { path: '/hospital/event-approval', label: 'Duyệt sự kiện', icon: 'check' },
        { path: '/hospital/registrations', label: 'Danh sách đăng ký', icon: 'list' },
        { path: '/hospital/blood-type-confirmation', label: 'Xác thực nhóm máu', icon: 'droplet' }
      ]
    },
    {
      title: 'Vận hành',
      items: [
        { path: '/hospital/results', label: 'Cập nhật kết quả', icon: 'edit' },
        { path: '/hospital/notifications', label: 'Tạo thông báo', icon: 'bell' }
      ]
    }
  ],
  nhom_tinh_nguyen: [
    {
      title: 'Tổng quan',
      items: [{ path: '/volunteer/dashboard', label: 'Dashboard', icon: 'dashboard' }]
    }
  ],
  admin: [
    {
      title: 'Quản trị hệ thống',
      items: [
        { path: '/admin/dashboard', label: 'Tổng quan', icon: 'dashboard' },
        { path: '/admin/users', label: 'Quản lý người dùng', icon: 'user' },
        { path: '/admin/events', label: 'Quản lý sự kiện', icon: 'calendar' },
        { path: '/admin/registrations', label: 'Đăng ký hiến máu', icon: 'list' },
        { path: '/admin/reports', label: 'Báo cáo thống kê', icon: 'history' },
        { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: 'edit' }
      ]
    }
  ]
};

const Sidebar = ({ isOpen, isDesktop, collapsed, onClose, onToggleCollapse }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    if (!user) return [];

    const role = user.ten_vai_tro;
    return menuConfig[role] || [];
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
      edit: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M12 5l3 3-8 8H4v-3l8-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M11 6l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      bell: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
          <path d="M10 18a2 2 0 002-2H8a2 2 0 002 2zm6-6V9a6 6 0 10-12 0v3l-2 2v1h16v-1l-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (!isDesktop) {
      onClose();
    }
  };

  const menuSections = getMenuItems();
  const sidebarClasses = ['sidebar'];
  if (isDesktop) sidebarClasses.push('desktop');
  if (isOpen) sidebarClasses.push('open');
  if (isDesktop && collapsed) sidebarClasses.push('collapsed');

  return (
    <>
      {!isDesktop && isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={sidebarClasses.join(' ')}>
        <div className="sidebar-header">
          {!collapsed && <h3>Menu</h3>}
          {isDesktop ? (
            <button
              className="collapse-btn"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path
                  d="M12 5l5 5-5 5M8 5L3 10l5 5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div className="sidebar-section" key={section.title}>
              {!collapsed && <p className="sidebar-section-title">{section.title}</p>}
              {section.items.map((item) => (
                <button
                  key={item.path}
                  className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-icon">{getIcon(item.icon)}</span>
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

