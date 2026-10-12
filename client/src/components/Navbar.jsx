import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';
import {
  Sparkles, Home, CheckSquare, Calendar, Target,
  BarChart2, Bot, Award, BookOpen, Swords, Bell,
  User, Settings, Shield, LogOut, Volume2, VolumeX,
  Sun, Moon
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  xp = 240,
  level = 3,
  xpMax = 400,
  uncompletedCount = 0,
  unreadNotifsCount = 0,
  darkMode,
  setDarkMode
}) {
  const { user, logout } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());

  if (!user) return null;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.toggle(next);
    if (next) sound.playCompletionChime();
  };

  const getInitials = (name) => {
    if (!name) return 'HF';
    return name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const levelTitles = {
    1: 'Beginner',
    2: 'Consistent',
    3: 'Disciplined',
    4: 'Focused',
    5: 'Habit Master'
  };
  const currentTitle = levelTitles[Math.min(5, Math.max(1, level))] || 'Habit Master';

  const mainItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={17} /> },
    { id: 'habits', label: 'My Habits', icon: <CheckSquare size={17} />, hasPip: true, count: uncompletedCount },
    { id: 'calendar', label: 'Heatmap Calendar', icon: <Calendar size={17} /> },
    { id: 'goals', label: 'Goals', icon: <Target size={17} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={17} /> },
  ];

  const intelligenceItems = [
    { id: 'insights', label: 'AI Habit Coach', icon: <Bot size={17} /> },
    { id: 'badges', label: 'Achievements', icon: <Award size={17} /> },
    { id: 'challenges', label: 'Challenges', icon: <Swords size={17} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={17} /> },
  ];

  const systemItems = [
    { id: 'notifications', label: 'Notifications', icon: <Bell size={17} />, hasPip: unreadNotifsCount > 0, count: unreadNotifsCount },
    { id: 'profile', label: 'Profile', icon: <User size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        className="sb-logo"
        onClick={() => setActiveTab('dashboard')}
        style={{ cursor: 'pointer', paddingBottom: '0.4rem' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
          color: '#fff'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <div style={{
            fontSize: '1.22rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--text) 30%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1
          }}>
            HabitFlow AI
          </div>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--sub)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Productivity OS
          </div>
        </div>
      </div>

      {/* Quick utility controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '5px 8px',
        margin: '0.6rem 0 0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sound effects' : 'Enable audio chimes'}
            style={{
              background: 'none',
              border: 'none',
              color: soundEnabled ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              padding: '3px'
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--sub)' }}>
            {soundEnabled ? 'Audio On' : 'Muted'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--sub)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            padding: '3px'
          }}
        >
          {darkMode ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} />}
        </button>
      </div>

      {/* Productivity Section */}
      <div className="sb-sec">Productivity</div>
      {mainItems.map((item) => (
        <button
          key={item.id}
          className={`nb ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="ic">{item.icon}</span>
          {item.label}
          {item.hasPip && item.count > 0 && (
            <span className="nb-pip">{item.count}</span>
          )}
        </button>
      ))}

      {/* Intelligence & Growth */}
      <div className="sb-sec" style={{ marginTop: '0.65rem' }}>AI & Growth</div>
      {intelligenceItems.map((item) => (
        <button
          key={item.id}
          className={`nb ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="ic">{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Platform & Account */}
      <div className="sb-sec" style={{ marginTop: '0.65rem' }}>Platform</div>
      {systemItems.map((item) => (
        <button
          key={item.id}
          className={`nb ${activeTab === item.id ? 'on' : ''}`}
          onClick={() => setActiveTab(item.id)}
        >
          <span className="ic">{item.icon}</span>
          {item.label}
          {item.hasPip && item.count > 0 && (
            <span className="nb-pip" style={{ background: '#ef4444' }}>{item.count}</span>
          )}
        </button>
      ))}

      {/* Admin Dashboard */}
      <button
        className={`nb ${activeTab === 'admin' ? 'on' : ''}`}
        onClick={() => setActiveTab('admin')}
        style={{
          color: activeTab === 'admin' ? 'var(--accent)' : 'var(--purple)',
          borderLeft: activeTab === 'admin' ? '3px solid var(--purple)' : 'none'
        }}
      >
        <span className="ic"><Shield size={17} color="#8b5cf6" /></span>
        Admin Portal
      </button>

      {/* Sign Out */}
      <button
        className="nb"
        onClick={logout}
        style={{ color: 'var(--red)', marginTop: '0.4rem' }}
      >
        <span className="ic"><LogOut size={16} /></span>
        Sign Out
      </button>

      {/* Gamification Level Box */}
      <div className="sb-xp">
        <div className="xp-row">
          <span className="xp-lv">
            Level {level} · {currentTitle} ⚡
          </span>
          <span className="xp-pts">{xp}/{xpMax} XP</span>
        </div>
        <div className="xp-bar">
          <div
            className="xp-fill"
            style={{ width: `${Math.min(100, Math.round((xp / xpMax) * 100))}%` }}
          />
        </div>
      </div>

      {/* User Avatar Card */}
      <div
        className="sb-user"
        onClick={() => setActiveTab('profile')}
        style={{ cursor: 'pointer' }}
        title="View Profile"
      >
        <div className="sb-av">{getInitials(user.name)}</div>
        <div className="sb-uinfo">
          <div className="sb-uname">{user.name}</div>
          <div className="sb-umail">{user.email}</div>
        </div>
      </div>
    </aside>
  );
}
