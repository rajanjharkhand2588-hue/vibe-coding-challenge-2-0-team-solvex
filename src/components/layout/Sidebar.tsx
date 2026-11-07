import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Trophy,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Volleyball,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/players', icon: Users, label: 'Players' },
  { to: '/dashboard/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/dashboard/matches', icon: Trophy, label: 'Matches' },
  { to: '/dashboard/ready-players', icon: Star, label: 'Ready Players' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch {
      toast.error('Error signing out');
    }
  };

  const roleBadgeColor: Record<string, string> = {
    admin: '#22c55e',
    coach: '#6366f1',
    scout: '#f59e0b',
    player: '#3b82f6',
  };

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024 && isOpen) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile / Tablet overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
            display: 'none',
          }}
          className="sidebar-overlay"
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          width: isOpen ? 280 : 72,
          minHeight: '100vh',
          background: '#1a1d2e',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          overflow: 'hidden',
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      >
        {/* Logo Header */}
        <div
          style={{
            padding: isOpen ? '20px 18px' : '20px 0',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            minHeight: 72,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Volleyball size={22} color="white" />
            </div>
            {isOpen && (
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.2,
                  }}
                >
                  Academy Desk
                </h1>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500 }}>
                  Management
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {isOpen && (
            <button
              onClick={onToggle}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              className="sidebar-close-btn"
              aria-label="Close sidebar"
            >
              <ChevronLeft size={18} className="sidebar-desktop-chevron" />
              <X size={18} className="sidebar-mobile-close" style={{ display: 'none' }} />
            </button>
          )}
        </div>

        {/* Collapsed toggle button (desktop) */}
        {!isOpen && (
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: '14px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            aria-label="Expand sidebar"
          >
            <Menu size={22} />
          </button>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '14px 0', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={handleNavClick}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: isOpen ? '12px 18px' : '12px 0',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                    background: isActive ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                    borderRight: isActive ? '3px solid #6366f1' : '3px solid transparent',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s ease',
                    minHeight: 44,
                  })}
                  className="nav-link"
                >
                  <item.icon size={20} style={{ flexShrink: 0 }} />
                  {isOpen && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div
          style={{
            padding: isOpen ? '16px 18px' : '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.1)',
          }}
        >
          {profile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                justifyContent: isOpen ? 'flex-start' : 'center',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {isOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {profile.full_name}
                  </p>
                  <span
                    style={{
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: roleBadgeColor[profile.role] || '#9ca3af',
                      fontWeight: 700,
                    }}
                  >
                    {profile.role}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '11px 12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: 'none',
              borderRadius: 8,
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              justifyContent: isOpen ? 'flex-start' : 'center',
              transition: 'background 0.2s',
              minHeight: 42,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
          >
            <LogOut size={18} />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Responsive styles */}
      <style>{`
        .nav-link:hover {
          background: rgba(99, 102, 241, 0.08) !important;
          color: white !important;
        }
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            width: 280px !important;
          }
          .sidebar.sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar-desktop-chevron {
            display: none !important;
          }
          .sidebar-mobile-close {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
