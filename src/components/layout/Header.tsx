import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header
      style={{
        height: 64,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            color: '#475569',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(17px, 4vw, 20px)',
            fontWeight: 600,
            color: '#0f172a',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f1f5f9',
            borderRadius: 8,
            padding: '8px 14px',
            border: '1px solid transparent',
            transition: 'border-color 0.2s',
          }}
          className="header-search"
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#334155',
              width: 180,
            }}
          />
        </div>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid white',
            }}
          />
        </button>

        {/* User avatar */}
        {profile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#334155',
                maxWidth: 130,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              className="header-username"
            >
              {profile.full_name}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .header-search {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
