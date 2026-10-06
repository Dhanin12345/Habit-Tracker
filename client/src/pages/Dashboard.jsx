import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const QUOTES = [
  { t: 'Small daily habits create big life changes.', a: '— James Clear' },
  { t: 'Discipline is choosing between what you want now and what you want most.', a: '— Abraham Lincoln' },
  { t: "You don't rise to the level of your goals, you fall to the level of your systems.", a: '— Atomic Habits' },
  { t: 'Every action you take is a vote for the person you want to become.', a: '— James Clear' },
  { t: 'The secret of getting ahead is getting started.', a: '— Mark Twain' },
  { t: 'Progress, not perfection — each step counts.', a: '— ZenHabit' },
  { t: 'Motivation gets you started. Habit keeps you going.', a: '— Jim Ryun' },
];

function Dashboard({ habits = [], checkinHabit, xp = 240, level = 3, setActiveTab, darkMode, setDarkMode }) {
  const { user } = useAuth();
  const [quote, setQuote] = useState({ t: '', a: '' });

  useEffect(() => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    if (hrs < 12) return `Good Morning, ${firstName}! ☀️`;
    if (hrs < 17) return `Good Afternoon, ${firstName}! 🌤️`;
    return `Good Evening, ${firstName}! 🌙`;
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayISO = new Date().toISOString().slice(0, 10);
  const isDoneToday = (h) => {
    return h.completedDates && h.completedDates.some((d) => d.slice(0, 10) === todayISO);
  };

  const activeHabits = habits.filter(h => !h.isArchived);
  const doneCount = activeHabits.filter(isDoneToday).length;
  const totalCount = activeHabits.length;
  const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak || 0)) : 0;

  // Personal daily completion target from user profile
  const userDailyTarget = user?.dailyTarget || 4;
  const targetPercent = Math.min(100, Math.round((doneCount / userDailyTarget) * 100));
  const isTargetAchieved = doneCount >= userDailyTarget;

  // Predictive streak-break detection
  const atRiskHabits = activeHabits.filter(h => !isDoneToday(h) && (h.streak || 0) >= 1);

  // Focus Habit recommendation
  const uncompletedActive = activeHabits.filter(h => !isDoneToday(h));
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };
  const sortedCandidates = [...uncompletedActive].sort(
    (a, b) => (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1) || (b.streak || 0) - (a.streak || 0)
  );
  const focusHabit = sortedCandidates[0] || null;

  // Unlocked badges logic
  const badgeCount = user?.badges ? user.badges.length : 1;

  // Sort and slice top streaks
  const streakLeaders = [...activeHabits]
    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
    .slice(0, 5);

  // Active challenges from local storage
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  useEffect(() => {
    const raw = localStorage.getItem('zh_challenges');
    if (raw) {
      const parsed = JSON.parse(raw);
      setJoinedChallenges(parsed.filter((c) => c.joined).slice(0, 3));
    } else {
      const defaults = [
        { id: 1, name: '30-Day Fitness', icon: '💪', days: 30, joined: true, prog: 7, color: '#f59e0b', bg: '#fffbeb' },
        { id: 3, name: 'Hydration Hero', icon: '💧', days: 14, joined: true, prog: 5, color: '#10b981', bg: '#ecfdf5' },
      ];
      localStorage.setItem('zh_challenges', JSON.stringify([
        ...defaults,
        { id: 2, name: 'Study Streak', icon: '📖', days: 21, joined: false, prog: 0, color: '#8b5cf6', bg: '#ede9fe' }
      ]));
      setJoinedChallenges(defaults);
    }
  }, []);

  return (
    <div className="page on">
      {/* Top Welcome Bar */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">{getGreeting()}</div>
          <div className="pg-sub">{todayStr} · Goal: {user?.goal || '🌟 All-round improvement'}</div>
        </div>
        <div className="tb-right">
          <button className="btn sm ghost" onClick={() => setActiveTab('insights')}>
            🧠 AI Coach & Insights
          </button>
          <button className="ib" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Predictive Streak Alert Banner if any habits at risk */}
      {atRiskHabits.length > 0 && (
        <div className="alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#dc2626' }}>
                Streak Protection Alert: {atRiskHabits.length} habit{atRiskHabits.length > 1 ? 's' : ''} at risk!
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--sub)' }}>
                {atRiskHabits.map(h => `${h.title} (🔥${h.streak}d)`).join(', ')}
              </div>
            </div>
          </div>
          <button
            className="btn sm"
            style={{ fontSize: '0.75rem', padding: '5px 12px', background: '#dc2626', color: '#fff' }}
            onClick={() => checkinHabit(atRiskHabits[0]._id)}
          >
            Check in {atRiskHabits[0].title.slice(0, 14)} ✓
          </button>
        </div>
      )}

      {/* Focus Habit Recommendation Card */}
      {focusHabit && (
        <div className="focus-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.9rem' }}>{focusHabit.icon || '⭐'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{focusHabit.title}</span>
                <span className={`priority-tag ${(focusHabit.priority || 'medium').toLowerCase()}`}>
                  {focusHabit.priority || 'Medium'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 800 }}>
                  🔥 {focusHabit.streak || 0}d streak
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--sub)', marginTop: '2px' }}>
                Recommended focus habit for maximum momentum today.
              </div>
            </div>
            <button className="btn sm" onClick={() => checkinHabit(focusHabit._id)}>
              Complete Now ✓
            </button>
          </div>
        </div>
      )}

      {/* Daily Motivation Quote */}
      <div className="quote">
        <div className="qt">"{quote.t}"</div>
        <div className="qa">{quote.a}</div>
      </div>

      {/* Stats Cards grid */}
      <div className="g4">
        {/* Daily Target Card */}
        <div className="sc">
          <div className="sc-ic" style={{ background: '#ecfdf5' }}>🎯</div>
          <div className="sc-v">
            {doneCount}
            <span style={{ fontSize: '0.95rem', color: 'var(--sub)' }}>/{userDailyTarget}</span>
          </div>
          <div className="sc-l">Daily Target</div>
          <div className="sc-d" style={{ color: isTargetAchieved ? '#16a34a' : 'var(--accent)', fontWeight: 700 }}>
            {isTargetAchieved ? '🏆 Target Met!' : `↑ ${targetPercent}% reached`}
          </div>
        </div>

        {/* Best Streak Card */}
        <div className="sc">
          <div className="sc-ic" style={{ background: '#fff7ed' }}>🔥</div>
          <div className="sc-v">{bestStreak}</div>
          <div className="sc-l">Best Streak</div>
          <div className="sc-d" style={{ color: '#f97316' }}>days running</div>
        </div>

        {/* Badges Earned Card */}
        <div className="sc">
          <div className="sc-ic" style={{ background: '#ede9fe' }}>🏅</div>
          <div className="sc-v">{badgeCount}</div>
          <div className="sc-l">Badges Earned</div>
          <div className="sc-d up">Achievements</div>
        </div>

        {/* XP Points Card */}
        <div className="sc">
          <div className="sc-ic" style={{ background: '#fdf2f8' }}>⚡</div>
          <div className="sc-v">{xp}</div>
          <div className="sc-l">XP Points</div>
          <div className="sc-d" style={{ color: 'var(--accent)' }}>Level {level}</div>
        </div>
      </div>

      {/* Main Double Grid */}
      <div className="g2" style={{ marginBottom: '1.25rem' }}>
        {/* Left Side: Habits list */}
        <div className="card">
          <div className="ct">
            📋 Today's Habits{' '}
            <span className="sa" onClick={() => setActiveTab('habits')}>
              View all ({activeHabits.length}) →
            </span>
          </div>

          {activeHabits.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)', padding: '1rem 0' }}>
              No active habits created yet. Click{' '}
              <span className="lnk" onClick={() => setActiveTab('habits')}>here</span> to make one!
            </p>
          ) : (
            activeHabits.slice(0, 4).map((h) => {
              const done = isDoneToday(h);
              const habitColor = h.color || '#10b981';
              return (
                <div
                  key={h._id}
                  className={`hr ${done ? 'done' : ''}`}
                  style={{
                    padding: '0.65rem 0.85rem',
                    marginBottom: '0.42rem',
                    borderLeft: `3px solid ${habitColor}`
                  }}
                >
                  <div
                    className="h-em"
                    style={{
                      background: `${habitColor}18`,
                      width: '34px',
                      height: '34px',
                      fontSize: '1rem'
                    }}
                  >
                    {h.icon || '⭐'}
                  </div>
                  <div className="h-bd">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="h-nm" style={{ fontSize: '0.83rem' }}>{h.title}</span>
                      <span className={`priority-tag ${(h.priority || 'medium').toLowerCase()}`}>
                        {h.priority || 'Medium'}
                      </span>
                    </div>
                    <div className="h-mt">
                      {h.category} · 🔥 {h.streak}d streak
                    </div>
                  </div>
                  <button
                    className={`chk ${done ? 'done' : ''}`}
                    onClick={() => checkinHabit(h._id)}
                    disabled={done}
                  >
                    ✓
                  </button>
                </div>
              );
            })
          )}

          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: 'var(--sub)', marginBottom: '0.32rem' }}>
              <span>OVERALL DAILY COMPLETION</span>
              <span>{donePercent}%</span>
            </div>
            <div className="pb">
              <div
                className="pf"
                style={{
                  background: donePercent === 100 ? '#16a34a' : 'var(--accent)',
                  width: `${donePercent}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Streaks Leaders & Badges */}
        <div className="card">
          <div className="ct">🔥 Streak Leaders</div>
          {streakLeaders.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--sub)', padding: '0.4rem 0' }}>Streaks will appear once habits are checked in!</p>
          ) : (
            streakLeaders.map((h, i) => (
              <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.42rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.88rem', width: '20px' }}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || '⚡'}</span>
                <span style={{ fontSize: '1rem' }}>{h.icon || '⭐'}</span>
                <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.title}
                </div>
                <span className={`priority-tag ${(h.priority || 'medium').toLowerCase()}`}>
                  {h.priority || 'Medium'}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f97316' }}>🔥{h.streak}</span>
              </div>
            ))
          )}

          <div className="ct" style={{ marginTop: '1.2rem' }}>
            🏅 Earned Badges{' '}
            <span className="sa" onClick={() => setActiveTab('badges')}>
              All →
            </span>
          </div>
          {user?.badges && user.badges.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem', marginTop: '0.3rem' }}>
              {user.badges.slice(0, 3).map((b, idx) => (
                <div key={idx} style={{ background: 'var(--accent-l)', borderRadius: '7px', padding: '3px 9px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
                  🏅 {b}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.38rem', marginTop: '0.3rem' }}>
              <div style={{ background: 'var(--accent-l)', borderRadius: '7px', padding: '3px 9px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
                🏅 Starter Badge
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Challenges card footer */}
      <div className="card">
        <div className="ct">
          🏆 Active Challenges{' '}
          <span className="sa" onClick={() => setActiveTab('challenges')}>
            View all →
          </span>
        </div>
        <div className="g3">
          {joinedChallenges.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontSize: '0.82rem', color: 'var(--sub)' }}>
              No active challenges yet.{' '}
              <span className="lnk" onClick={() => setActiveTab('challenges')}>
                Join one →
              </span>
            </div>
          ) : (
            joinedChallenges.map((c) => {
              const progPct = Math.round((c.prog / c.days) * 100);
              return (
                <div key={c.id} style={{ padding: '0.8rem 0.95rem', borderRadius: '10px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{c.icon}</span>
                    <span style={{ fontSize: '0.81rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{c.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.71rem', fontWeight: 800, color: c.color }}>{progPct}%</span>
                  </div>
                  <div className="pb" style={{ height: '4px' }}>
                    <div className="pf" style={{ background: c.color, width: `${progPct}%` }} />
                  </div>
                  <div style={{ fontSize: '0.69rem', color: 'var(--sub)', marginTop: '0.28rem' }}>
                    Day {c.prog} of {c.days}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
