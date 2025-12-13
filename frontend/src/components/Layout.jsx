import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = true }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 1024);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
      setIsSidebarCollapsed(false);
    }
  }, [isDesktop]);

  const handleMenuToggle = () => {
    if (isDesktop) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const shouldShowSidebar = user && showSidebar;
  const reserveSidebarSpace = shouldShowSidebar && isDesktop && sidebarOpen;

  return (
    <div className="app-layout">
      <Navbar onMenuClick={handleMenuToggle} />
      
      <div className="layout-container">
        {shouldShowSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            isDesktop={isDesktop}
            collapsed={isSidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        )}
        
        <main
          className={`main-content ${reserveSidebarSpace ? 'with-sidebar' : ''} ${
            reserveSidebarSpace && isSidebarCollapsed ? 'collapsed' : ''
          }`}
        >
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

