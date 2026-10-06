import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const COMMON_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
];

function Settings({ habits = [], darkMode, setDarkMode, resetProgress }) {
  const { user, logout, showToast, fetchWithAuth, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [goal, setGoal] = useState(user?.goal || '🌟 All-round improvement');
  const [dailyTarget, setDailyTarget] = useState(user?.dailyTarget || 4);
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setGoal(user.goal || '🌟 All-round improvement');
      setDailyTarget(user.dailyTarget || 4);
      setBio(user.bio || '');
      setTimezone(user.timezone || 'UTC');
    }
  }, [user]);

  const saveProfile = async () => {
    if (!displayName.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/auth/profile', {
        method: 'PUT',
        body: {
          name: displayName.trim(),
          goal: goal,
          dailyTarget: parseInt(dailyTarget) || 4,
          bio: bio.trim(),
          timezone: timezone
        }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('zh_user', JSON.stringify(updatedUser));
        showToast('Profile saved to server! ✅', 'success');
      } else {
        showToast('Failed to save profile', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = () => {
    if (!window.confirm('Reset all streaks, XP and progress? This cannot be undone.')) return;
    resetProgress();
  };

  // Real server-generated CSV download
  const handleServerCSVExport = async () => {
    try {
      showToast('Generating CSV report from server...', 'info');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/habits/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenhabit_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('CSV downloaded successfully! 📥', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Error exporting CSV', 'error');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ZH';
    return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="page on">
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Settings & Preferences</div>
          <div className="pg-sub">Manage your account profile, daily targets, and preferences</div>
        </div>
      </div>

      <div className="g2">
        {/* LEFT COLUMN: Profile & Goals */}
        <div>
          <div className="card" style={{ marginBottom: '0.9rem' }}>
            <div className="ct">👤 Server-Side User Profile</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem', background: 'var(--accent-l)', borderRadius: '10px', marginBottom: '0.95rem' }}>
              <div className="av" style={{ width: '50px', height: '50px', fontSize: '1.1rem' }}>
                {getInitials(user?.name)}
              </div>
              <div>
                <div style={{ fontWeight: 800 }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sub)' }}>{user?.email}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginTop: '2px' }}>
                  Daily Goal: {dailyTarget} habits · {timezone}
                </div>
              </div>
            </div>

            <div className="field">
              <label>Display Name</label>
              <input
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Primary Focus Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                <option>📚 Build study habits</option>
                <option>💪 Improve fitness & stamina</option>
                <option>🧘 Mental wellness & meditation</option>
                <option>💧 Health, hydration & sleep</option>
                <option>🌟 All-round improvement</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Daily Completion Target</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 1.2 }}>
                <label>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {COMMON_TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label>Personal Bio / Mission</label>
              <textarea
                placeholder="Share your personal motivation or quote..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="2"
                style={{
                  width: '100%',
                  border: '1.5px solid var(--border)',
                  borderRadius: '9px',
                  padding: '8px 10px',
                  fontSize: '0.84rem',
                  fontFamily: 'inherit',
                  background: 'var(--card)',
                  color: 'var(--text)'
                }}
              />
            </div>

            <button className="btn sm" onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile to Server ✓'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Preferences & Data */}
        <div>
          <div className="card" style={{ marginBottom: '0.9rem' }}>
            <div className="ct">🎨 Interface & Preferences</div>
            <div className="srow">
              <div>
                <div className="sl">Dark Mode Theme</div>
                <div className="ss">Toggle high-contrast dark palette</div>
              </div>
              <label className="sw">
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <span className="sw-sl" />
              </label>
            </div>
            <div className="srow">
              <div>
                <div className="sl">Predictive Streak Alerts</div>
                <div className="ss">Highlight habits at risk of breaking streak</div>
              </div>
              <label className="sw">
                <input type="checkbox" defaultChecked />
                <span className="sw-sl" />
              </label>
            </div>
            <div className="srow">
              <div>
                <div className="sl">Sound & Celebration Micro-Animations</div>
                <div className="ss">Play effects on XP milestones</div>
              </div>
              <label className="sw">
                <input type="checkbox" defaultChecked />
                <span className="sw-sl" />
              </label>
            </div>
          </div>

          <div className="card">
            <div className="ct">📥 Data Management & Export</div>
            <div className="srow">
              <div>
                <div className="sl">Server-Generated CSV Export</div>
                <div className="ss">Download complete habit history and metadata</div>
              </div>
              <button className="btn sm ghost" onClick={handleServerCSVExport}>
                Export CSV 📥
              </button>
            </div>
            <div className="srow">
              <div>
                <div className="sl">Reset Local Progress</div>
                <div className="ss">Reset XP points and level back to level 1</div>
              </div>
              <button className="btn sm danger" onClick={handleResetAll}>
                Reset
              </button>
            </div>
            <div className="srow" style={{ borderBottom: 'none' }}>
              <div>
                <div className="sl">Sign Out</div>
                <div className="ss">Safely end your session</div>
              </div>
              <button className="btn sm" style={{ background: 'var(--red)', color: '#fff' }} onClick={logout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
