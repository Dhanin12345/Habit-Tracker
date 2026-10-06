import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ activeTab, setActiveTab, xp = 240, level = 3, xpMax = 400, uncompletedCount = 0 }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'ZH';
    return name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'habits', label: 'Habits', icon: '✅', hasPip: true },
    { id: 'insights', label: 'Smart Insights', icon: '🧠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const engageItems = [
    { id: 'challenges', label: 'Challenges', icon: '🏆' },
    { id: 'badges', label: 'Badges', icon: '🏅' },
    { id: 'history', label: 'History', icon: '📅' },
    { id: 'journal', label: 'Journal', icon: '📝' },
  ];

  return (
    <aside className="sidebar">
      <div className="sb-logo" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="sb-leaf">🌿</div>
        <div className="sb-name">ZenHabit</div>
      </div>

      <div className="sb-sec">Main</div>
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`nb ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="ic">{item.icon}</span>
          {item.label}
          {item.hasPip && uncompletedCount > 0 && (
            <span className="nb-pip">{uncompletedCount}</span>
          )}
        </button>
      ))}

      <div className="sb-sec" style={{ marginTop: '0.7rem' }}>Engage</div>
      {engageItems.map((item) => (
        <button
          key={item.id}
          className={`nb ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="ic">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="sb-sec" style={{ marginTop: '0.7rem' }}>Account</div>
      <button
        className={`nb ${activeTab === 'profile' ? 'on' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <span className="ic">👤</span>
        Profile
      </button>
      <button
        className={`nb ${activeTab === 'settings' ? 'on' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <span className="ic">⚙️</span>
        Settings
      </button>
      <button
        className="nb"
        onClick={logout}
        style={{ color: 'var(--red)' }}
      >
        <span className="ic">🚪</span>
        Sign Out
      </button>

      <div className="sb-xp">
        <div className="xp-row">
          <span className="xp-lv">Level {level} ⚡</span>
          <span className="xp-pts">{xp}/{xpMax} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${Math.min(100, Math.round((xp / xpMax) * 100))}%` }}
          />
        </div>
      </div>

      <div className="sb-user" onClick={() => setActiveTab('profile')}>
        <div className="av" style={{ width: '36px', height: '36px', fontSize: '0.88rem' }}>
          {getInitials(user.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="u-name">{user.name}</div>
          <div className="u-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.goal || 'All-round improvement'}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Navbar;
