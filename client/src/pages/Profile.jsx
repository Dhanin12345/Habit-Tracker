import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ALL_BADGES = [
  {
    name: 'Starter Badge',
    description: 'Check in a habit for the first time',
    icon: '🚀',
    category: 'Basic',
    xp: 50
  },
  {
    name: 'Bronze Badge',
    description: 'Reach a 7-day streak on any habit',
    icon: '🥉',
    category: 'Streak',
    xp: 100
  },
  {
    name: 'Silver Badge',
    description: 'Reach a 15-day streak on any habit',
    icon: '🥈',
    category: 'Streak',
    xp: 150
  },
  {
    name: 'Legend',
    description: 'Reach a 21-day streak on any habit',
    icon: '🏆',
    category: 'Milestone',
    xp: 200
  },
  {
    name: 'Gold Badge',
    description: 'Reach a 30-day streak on any habit',
    icon: '🥇',
    category: 'Streak',
    xp: 250
  },
  {
    name: 'Consistency Master',
    description: 'Complete habits a total of 50 times',
    icon: '👑',
    category: 'Dedication',
    xp: 300
  },
  {
    name: 'Diverse Habits',
    description: 'Complete habits in 3 or more categories',
    icon: '🌈',
    category: 'Variety',
    xp: 120
  },
  {
    name: 'Perfect Day',
    description: 'Complete all active habits in a single day',
    icon: '⭐',
    category: 'Flawless',
    xp: 180
  }
];

function Profile({ setActiveTab }) {
  const { user, fetchWithAuth } = useAuth();
  const [stats, setStats] = useState({
    totalCompleted: 0,
    activeHabits: 0,
    longestStreak: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetchWithAuth('/api/habits?include_archived=true');
        if (res.ok) {
          const habits = await res.json();
          const active = habits.filter(h => !h.isArchived);
          const totalCompleted = habits.reduce((acc, h) => acc + (h.completedDates?.length || 0), 0);
          const activeHabits = active.length;
          const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak || h.streak || 0)) : 0;
          
          const totalStreaks = active.reduce((acc, h) => acc + (h.streak || 0), 0);
          const completionRate = activeHabits > 0 
            ? Math.min(100, Math.round((totalStreaks / (activeHabits * 7)) * 100))
            : 0;

          setStats({
            totalCompleted,
            activeHabits,
            longestStreak,
            completionRate
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  if (!user) return null;

  const userBadges = user.badges || [];
  const initials = user.name 
    ? user.name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'ZH';

  const unlockedCount = userBadges.length;
  const totalBadges = ALL_BADGES.length;
  const badgeProgressPct = Math.round((unlockedCount / totalBadges) * 100);

  return (
    <div className="page on">
      {/* Top Bar Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">My Profile</div>
          <div className="pg-sub">Manage your account achievements, habits progress, and overview</div>
        </div>
        <div className="tb-right">
          <span style={{ fontSize: '0.75rem', background: 'var(--accent-l)', color: 'var(--accent)', padding: '5px 12px', borderRadius: '8px', fontWeight: 800 }}>
            {user.timezone || 'UTC'}
          </span>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="g4" style={{ marginBottom: '1.25rem' }}>
        <div className="sc">
          <div className="sc-ic" style={{ background: '#ecfdf5' }}>📋</div>
          <div className="sc-v">{stats.activeHabits}</div>
          <div className="sc-l">Active Habits</div>
          <div className="sc-d up">Routines tracked</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#ede9fe' }}>✅</div>
          <div className="sc-v">{stats.totalCompleted}</div>
          <div className="sc-l">Total Check-ins</div>
          <div className="sc-d" style={{ color: 'var(--accent)' }}>All-time completions</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#fff7ed' }}>🔥</div>
          <div className="sc-v">{stats.longestStreak}</div>
          <div className="sc-l">Best Streak</div>
          <div className="sc-d" style={{ color: '#f97316' }}>Consecutive days</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#fdf2f8' }}>🏅</div>
          <div className="sc-v">{unlockedCount} / {totalBadges}</div>
          <div className="sc-l">Badges Earned</div>
          <div className="sc-d" style={{ color: '#ec4899' }}>{badgeProgressPct}% unlocked</div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="g2">
        {/* Left Column: User Profile Hero Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="ct">👤 Account Identity</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', padding: '1.2rem', background: 'var(--accent-l)', borderRadius: '12px', marginBottom: '1.2rem' }}>
              <div className="av" style={{ width: '64px', height: '64px', fontSize: '1.45rem', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)' }}>
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', marginBottom: '2px' }}>
                  {user.name}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--sub)', fontWeight: 500 }}>
                  {user.email}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--card)', color: 'var(--accent)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    🎯 Goal: {user.goal || 'All-round improvement'}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: 'var(--card)', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    Daily Target: {user.dailyTarget || 4} habits
                  </span>
                </div>
              </div>
            </div>

            {user.bio && (
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.15rem', fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.5 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', marginBottom: '4px' }}>Personal Mission:</div>
                "{user.bio}"
              </div>
            )}

            {/* Milestones Progress Table */}
            <div className="ct" style={{ marginTop: '0.5rem' }}>📈 Milestones & Performance</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span>Badge Completion Progress</span>
                  <span style={{ color: 'var(--accent)' }}>{badgeProgressPct}%</span>
                </div>
                <div className="pb" style={{ height: '7px' }}>
                  <div className="pf" style={{ width: `${badgeProgressPct}%`, background: 'var(--accent)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span>Habit Consistency Metric</span>
                  <span style={{ color: '#f97316' }}>{stats.completionRate}%</span>
                </div>
                <div className="pb" style={{ height: '7px' }}>
                  <div className="pf" style={{ width: `${stats.completionRate}%`, background: '#f97316' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges Showcase Grid */}
        <div className="card">
          <div className="ct" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🏅 Achievement Badges Showcase</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--sub)', fontWeight: 700 }}>
              {unlockedCount} of {totalBadges} Unlocked
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--sub)', marginBottom: '1.1rem' }}>
            Complete your habits and maintain unbroken streaks to unlock prestigious accomplishment badges.
          </p>

          {loading ? (
            <p style={{ fontSize: '0.84rem', color: 'var(--sub)', padding: '2rem 0', textAlign: 'center' }}>
              Loading badges... ⏳
            </p>
          ) : (
            <div className="bg-grid">
              {ALL_BADGES.map((b) => {
                const isEarned = userBadges.includes(b.name);
                return (
                  <div key={b.name} className={`bc ${isEarned ? 'earned' : 'locked'}`} style={{ position: 'relative' }}>
                    <em style={{ fontSize: '2rem', display: 'block', marginBottom: '0.45rem' }}>{b.icon}</em>
                    <strong style={{ display: 'block', fontSize: '0.86rem', marginBottom: '0.25rem', color: isEarned ? 'var(--text)' : 'var(--sub)' }}>
                      {b.name}
                    </strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--sub)', lineHeight: 1.35, minHeight: '32px' }}>
                      {b.description}
                    </span>
                    <div style={{ marginTop: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isEarned ? 'var(--accent-l)' : 'var(--bg)',
                          color: isEarned ? 'var(--accent)' : 'var(--muted)',
                          border: `1px solid ${isEarned ? 'var(--accent)' : 'var(--border)'}`
                        }}
                      >
                        {isEarned ? `✓ Unlocked (+${b.xp} XP)` : '🔒 Locked'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', background: 'var(--bg)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '1.3rem' }}>✨</span>
            <p style={{ fontSize: '0.79rem', color: 'var(--sub)', lineHeight: 1.4 }}>
              Streaks reset if habits are not checked in or skipped before midnight. Keep momentum alive to claim the Gold & Legend trophies!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
