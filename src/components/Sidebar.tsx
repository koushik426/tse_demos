import { NavLink, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, Sparkles, ChevronLeft, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const initials = username
    ? username.split('@')[0].slice(0, 2).toUpperCase()
    : 'SL';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <Zap size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Salesloft</span>
            <span className="sidebar-logo-subtitle">Analytics Portal</span>
          </div>
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon"><Home size={18} /></span>
            <span className="nav-item-text">Overview</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Analytics</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
            <span className="nav-item-text">Sales Dashboard</span>
          </NavLink>
          <NavLink
            to="/spotter"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon"><Sparkles size={18} /></span>
            <span className="nav-item-text">AI Assistant</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={handleLogout} title="Sign out">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{username || 'Salesloft User'}</div>
            <div className="sidebar-user-role" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <LogOut size={10} />
              Sign out
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
