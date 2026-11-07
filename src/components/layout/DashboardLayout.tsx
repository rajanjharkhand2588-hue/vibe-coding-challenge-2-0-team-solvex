import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/players': 'Players',
  '/dashboard/attendance': 'Attendance',
  '/dashboard/matches': 'Matches',
  '/dashboard/ready-players': 'Ready Players',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return true;
  });
  const location = useLocation();

  // Auto-close drawer on route change when on mobile/tablet screens
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 280 : 72,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
        className="main-content"
      >
        <Header
          title={pageTitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="dashboard-main-area" style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: 10,
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: 14,
          },
        }}
      />

      <style>{`
        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0 !important;
          }
          .dashboard-main-area {
            padding: 16px 14px !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-main-area {
            padding: 14px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
