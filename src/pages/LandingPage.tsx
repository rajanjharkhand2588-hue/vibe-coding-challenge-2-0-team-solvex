import { useNavigate } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  Trophy,
  Star,
  ArrowRight,
  Shield,
  BarChart3,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Player Management',
    description:
      'Register, organize, and manage every player in your academy with detailed profiles and performance history.',
    color: '#3b82f6',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'One-click daily attendance with session management. Lock sessions to prevent tampering.',
    color: '#22c55e',
  },
  {
    icon: Trophy,
    title: 'Match Performance',
    description:
      'Record match scores tied to attendance. Only present players qualify — automatically enforced.',
    color: '#f59e0b',
  },
  {
    icon: Star,
    title: 'Trial Readiness',
    description:
      'Automatically identify players ready for trials based on attendance percentage and match participation.',
    color: '#a855f7',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav
        className="landing-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1d2e' }}>
            Academy Desk
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: '#fff',
              color: '#374151',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.color = '#374151';
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="landing-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          textAlign: 'center',
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 50,
              padding: '8px 20px',
              marginBottom: 32,
            }}
          >
            <Zap size={14} color="#3b82f6" />
            <span style={{ fontSize: 13, color: '#93c5fd', fontWeight: 500 }}>
              Sports Academy Management Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              margin: '0 0 24px',
              letterSpacing: -1.5,
            }}
          >
            Every Player.{' '}
            <span style={{ color: '#3b82f6' }}>Every Practice.</span>{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Every Performance.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 600,
              margin: '0 auto 48px',
            }}
          >
            Transform your sports academy from paper notebooks to a powerful digital
            platform. Track attendance, record match scores, and automatically identify
            trial-ready players.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Start Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e2e8f0',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              Sign In
            </button>
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 48,
              marginTop: 72,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Active Players', value: '500+' },
              { label: 'Sessions Tracked', value: '10K+' },
              { label: 'Matches Recorded', value: '2K+' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#f0fdf4',
              borderRadius: 50,
              padding: '6px 16px',
              marginBottom: 16,
            }}
          >
            <BarChart3 size={14} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Features</span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 700,
              color: '#1a1d2e',
              margin: '0 0 16px',
            }}
          >
            Everything Your Academy Needs
          </h2>
          <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 600, margin: '0 auto' }}>
            From daily attendance to trial readiness — manage your entire academy from one
            powerful dashboard.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                padding: 32,
                borderRadius: 16,
                border: '1px solid #e5e7eb',
                background: '#fff',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = feature.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `${feature.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <feature.icon size={24} color={feature.color} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1a1d2e',
                  margin: '0 0 10px',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="landing-cta"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 16px',
          }}
        >
          Ready to Digitize Your Academy?
        </h2>
        <p style={{ fontSize: 18, color: '#94a3b8', marginBottom: 36 }}>
          Join Academy Desk and take control of your player management today.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 40px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Started for Free <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer
        className="landing-footer"
        style={{
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} Academy Desk. Built for sports academies everywhere.
      </footer>
    </div>
  );
}
