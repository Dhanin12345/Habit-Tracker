import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/sound';
import {
  Bell, CheckCircle, Flame, Trophy, Brain,
  Trash2, Volume2, CheckCheck, Send, ShieldAlert, Sparkles
} from 'lucide-react';

export default function Notifications() {
  const { fetchWithAuth, showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [browserPermission, setBrowserPermission] = useState('default');

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await fetchWithAuth(`/api/notifications/read/${id}`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await fetchWithAuth('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await fetchWithAuth('/api/notifications/clear', { method: 'DELETE' });
      setNotifications([]);
      showToast('All notifications cleared.', 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Browser notifications not supported in this browser.', 'warning');
      return;
    }
    const perm = await Notification.requestPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      showToast('Browser notifications enabled! 🔔');
      new Notification('HabitFlow AI', {
        body: 'Desktop habit reminders successfully activated!',
        icon: 'favicon.ico'
      });
    } else {
      showToast('Browser notification permission denied or dismissed.', 'warning');
    }
  };

  const sendTestNotification = async () => {
    try {
      const res = await fetchWithAuth('/api/notifications/create', {
        method: 'POST',
        body: {
          title: '🔔 Habit Reminder: Hydration Check',
          message: 'Time to drink a fresh glass of water to keep your focus sharp!',
          type: 'reminder'
        }
      });
      if (res.ok) {
        const newNotif = await res.json();
        setNotifications(prev => [newNotif, ...prev]);
        sound.playCompletionChime();
        showToast('Test reminder notification triggered!');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const displayed = notifications.filter(n => filterType === 'all' || n.type === filterType);
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'streak': return <Flame size={17} color="#f59e0b" />;
      case 'achievement': return <Trophy size={17} color="#8b5cf6" />;
      case 'ai': return <Brain size={17} color="var(--accent)" />;
      default: return <Bell size={17} color="#3b82f6" />;
    }
  };

  return (
    <div className="page on">
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Notification Center</div>
          <div className="pg-sub">
            In-app alerts, streak warnings, achievement notifications, and reminder triggers
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-s"
            onClick={sendTestNotification}
          >
            <Send size={15} /> Send Test Alert
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn-s"
              onClick={handleReadAll}
            >
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="btn-s"
              style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={handleClearAll}
            >
              <Trash2 size={15} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Browser Notifications Permissions Card */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--accent-l)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--accent)'
          }}>
            <Bell size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text)' }}>
              Browser Push Reminders
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--sub)' }}>
              {browserPermission === 'granted'
                ? '✅ Enabled: You will receive native system notifications for scheduled habit cues.'
                : 'Enable system desktop notifications so you never break an active streak.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-s"
            onClick={() => sound.playStreakChime()}
            title="Preview Audio Chime"
          >
            <Volume2 size={15} /> Test Sound
          </button>

          {browserPermission !== 'granted' && (
            <button
              type="button"
              className="btn-p"
              onClick={requestBrowserPermission}
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="subtab-bar">
        <button
          type="button"
          className={`subtab-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${filterType === 'reminder' ? 'active' : ''}`}
          onClick={() => setFilterType('reminder')}
        >
          🔔 Reminders ({notifications.filter(n => n.type === 'reminder').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${filterType === 'streak' ? 'active' : ''}`}
          onClick={() => setFilterType('streak')}
        >
          🔥 Streaks ({notifications.filter(n => n.type === 'streak').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${filterType === 'achievement' ? 'active' : ''}`}
          onClick={() => setFilterType('achievement')}
        >
          🏆 Badges ({notifications.filter(n => n.type === 'achievement').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${filterType === 'ai' ? 'active' : ''}`}
          onClick={() => setFilterType('ai')}
        >
          🧠 AI Tips ({notifications.filter(n => n.type === 'ai').length})
        </button>
      </div>

      {/* Notifications List */}
      {displayed.length === 0 ? (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--sub)'
        }}>
          <Sparkles size={36} color="var(--accent)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>No notifications here</h3>
          <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
            You're all caught up! New reminders, streak alerts, and badge achievements will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {displayed.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderLeft: n.readStatus ? '1px solid var(--border)' : '4px solid var(--accent)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: 'var(--shadow)',
                cursor: 'pointer',
                opacity: n.readStatus ? 0.8 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(n.type)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--sub)', marginTop: '2px', lineHeight: 1.45 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
              </div>

              {!n.readStatus && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  flexShrink: 0,
                  marginTop: '6px'
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
