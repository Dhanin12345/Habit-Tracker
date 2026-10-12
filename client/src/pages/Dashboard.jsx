import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Flame, Trophy, CheckCircle, Clock, Plus,
  ArrowRight, AlertTriangle, Brain, Target, Calendar,
  TrendingUp, Award, Zap
} from 'lucide-react';
import HabitDetailModal from '../components/HabitDetailModal';

const QUOTES = [
  { t: 'Small daily habits create big compound life changes.', a: '— James Clear' },
  { t: 'Discipline is choosing between what you want now and what you want most.', a: '— Abraham Lincoln' },
  { t: "You don't rise to the level of your goals, you fall to the level of your systems.", a: '— Atomic Habits' },
  { t: 'Every action you take is a vote for the person you want to become.', a: '— James Clear' },
  { t: 'The secret of getting ahead is getting started.', a: '— Mark Twain' },
  { t: 'Progress compounds silently before it manifests exponentially.', a: '— HabitFlow AI' },
];

export default function Dashboard({
  habits = [],
  checkinHabit,
  skipHabit,
  missHabit,
  pendingHabit,
  addHabit,
  editHabit,
  duplicateHabit,
  pauseToggleHabit,
  archiveHabit,
  deleteHabit,
  setActiveTab,
  onOpenCreateHabit,
  xp = 240,
  level = 3
}) {
  const { user } = useAuth();
  const [quote, setQuote] = useState({ t: '', a: '' });
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState(null);
  const [filterToday, setFilterToday] = useState('all'); // all, pending, completed

  useEffect(() => {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(q);
  }, []);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    const firstName = user?.name ? user.name.split(' ')[0] : 'Dhanin';
    if (hrs < 12) return `Good Morning, ${firstName}! 👋`;
    if (hrs < 17) return `Good Afternoon, ${firstName}! 🌤️`;
    return `Good Evening, ${firstName}! 🌙`;
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const todayISO = new Date().toISOString().slice(0, 10);

  const isDoneToday = (h) => h.completedDates && h.completedDates.some(d => d.slice(0, 10) === todayISO);
  const isSkippedToday = (h) => h.skippedDates && h.skippedDates.some(d => d.slice(0, 10) === todayISO);
  const isMissedToday = (h) => h.missedDates && h.missedDates.some(d => d.slice(0, 10) === todayISO);

  const activeHabits = habits.filter(h => !h.isArchived && h.status !== 'paused');
  const doneCount = activeHabits.filter(isDoneToday).length;
  const totalActive = activeHabits.length;
  const donePercent = totalActive > 0 ? Math.round((doneCount / totalActive) * 100) : 0;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

  const userDailyTarget = user?.dailyTarget || 4;
  const targetPercent = Math.min(100, Math.round((doneCount / userDailyTarget) * 100));

  // Predictive streak risk detection (habits with active streak not done today)
  const atRiskHabits = activeHabits.filter(h => !isDoneToday(h) && (h.streak || 0) >= 1);

  // Focus Habit (High priority uncompleted, then longest active streak)
  const uncompletedActive = activeHabits.filter(h => !isDoneToday(h));
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };
  const sortedCandidates = [...uncompletedActive].sort(
    (a, b) => (priorityWeights[b.priority] || 1) - (priorityWeights[a.priority] || 1) || (b.streak || 0) - (a.streak || 0)
  );
  const focusHabit = sortedCandidates[0] || null;

  // Filter today's habits
  let displayedTodayHabits = activeHabits;
  if (filterToday === 'pending') {
    displayedTodayHabits = activeHabits.filter(h => !isDoneToday(h) && !isSkippedToday(h) && !isMissedToday(h));
  } else if (filterToday === 'completed') {
    displayedTodayHabits = activeHabits.filter(isDoneToday);
  }

  // Weekly days dots
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="page on">
      {/* Top Welcome Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">{getGreeting()}</div>
          <div className="pg-sub">
            {todayStr} · Target: {doneCount}/{userDailyTarget} Habits ({targetPercent}%)
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-s"
            onClick={() => setActiveTab('insights')}
          >
            <Brain size={16} color="var(--accent)" />
            AI Habit Coach
          </button>
          <button
            type="button"
            className="btn-p"
            onClick={onOpenCreateHabit}
          >
            <Plus size={16} />
            New Habit
          </button>
        </div>
      </div>

      {/* Motivational Quote Banner */}
      {quote.t && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '0.8rem 1.15rem',
          marginBottom: '1.25rem',
          fontSize: '0.84rem',
          color: 'var(--sub)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✨</span>
          <span>"{quote.t}" <strong style={{ color: 'var(--text)' }}>{quote.a}</strong></span>
        </div>
      )}

      {/* Streak Protection Alert Banner */}
      {atRiskHabits.length > 0 && (
        <div className="alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#ef4444' }}>
                Streak Protection Alert
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text)' }}>
                You have {atRiskHabits.length} habit{atRiskHabits.length > 1 ? 's' : ''} with active streaks at risk of breaking before midnight!
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-s"
            style={{ fontSize: '0.78rem', padding: '5px 10px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => setFilterToday('pending')}
          >
            Review At-Risk
          </button>
        </div>
      )}

      {/* High-Leverage Focus Habit Card */}
      {focusHabit && (
        <div className="focus-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '2rem' }}>{focusHabit.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
                  {focusHabit.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--sub)' }}>
                  {focusHabit.priority === 'High' ? '🔴 Highest leverage goal for sustained focus today.' : `🔥 Keep your ${focusHabit.streak}-day streak alive!`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn-p"
                onClick={() => checkinHabit(focusHabit._id || focusHabit.id)}
              >
                <CheckCircle size={16} /> Complete Now (+10 XP)
              </button>
              <button
                type="button"
                className="btn-s"
                onClick={() => setSelectedHabitForDetail(focusHabit)}
              >
                Inspect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid g4" style={{ marginBottom: '1.5rem' }}>
        <div className="sc">
          <div className="sc-lbl">Active Habits</div>
          <div className="sc-val">{totalActive}</div>
          <div className="sc-sub">{habits.filter(h => h.status === 'paused').length} paused · {habits.filter(h => h.isArchived).length} archived</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Completed Today</div>
          <div className="sc-val" style={{ color: 'var(--accent)' }}>
            {doneCount} / {totalActive}
          </div>
          <div className="sc-sub">{donePercent}% of active habits done</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Active Streak 🔥</div>
          <div className="sc-val" style={{ color: '#f59e0b' }}>
            {maxStreak} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Days</span>
          </div>
          <div className="sc-sub">Best record across all habits</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Target Met</div>
          <div className="sc-val" style={{ color: '#3b82f6' }}>
            {targetPercent}%
          </div>
          <div className="sc-sub">Daily goal: {userDailyTarget} habits</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Today's Habits List */}
        <div>
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '1.35rem',
            boxShadow: 'var(--shadow)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Today's Habits</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--sub)' }}>
                  Mark your progress with 1-click tactile actions
                </p>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className={`subtab-btn ${filterToday === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterToday('all')}
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                >
                  All ({activeHabits.length})
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${filterToday === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterToday('pending')}
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                >
                  Pending ({activeHabits.length - doneCount})
                </button>
                <button
                  type="button"
                  className={`subtab-btn ${filterToday === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterToday('completed')}
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                >
                  Done ({doneCount})
                </button>
              </div>
            </div>

            {displayedTodayHabits.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--sub)',
                fontSize: '0.88rem'
              }}>
                <Sparkles size={32} color="var(--accent)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 700 }}>No habits in this view.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  {filterToday === 'pending' ? 'All active habits are completed for today! 🚀' : 'Create your first habit to begin.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayedTodayHabits.map((habit) => {
                  const habitId = habit._id || habit.id;
                  const isDone = isDoneToday(habit);
                  const isSkip = isSkippedToday(habit);
                  const isMiss = isMissedToday(habit);

                  return (
                    <div
                      key={habitId}
                      style={{
                        background: 'var(--surface)',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '0.9rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        transition: 'border 0.2s, background 0.2s'
                      }}
                    >
                      {/* Left: Icon, Title, Streak */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1, minWidth: '220px' }}
                        onClick={() => setSelectedHabitForDetail(habit)}
                        title="Click to view details"
                      >
                        <span style={{
                          fontSize: '1.4rem',
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: `${habit.color || '#10b981'}1f`,
                          display: 'grid',
                          placeItems: 'center'
                        }}>
                          {habit.icon || '⭐'}
                        </span>
                        <div>
                          <div style={{
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            color: 'var(--text)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            opacity: isDone ? 0.85 : 1
                          }}>
                            {habit.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>
                              {habit.category} · {habit.frequency}
                            </span>
                            {(habit.streak || 0) > 0 && (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                color: '#f59e0b',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                <Flame size={12} /> {habit.streak}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: 4-State Checkin Button Group */}
                      <div className="checkin-btn-group">
                        <button
                          type="button"
                          className={`chk-btn ${isDone ? 'active completed' : ''}`}
                          onClick={() => checkinHabit(habitId)}
                          title="Mark habit completed today"
                        >
                          ✓ Done
                        </button>
                        <button
                          type="button"
                          className={`chk-btn ${isSkip ? 'active skipped' : ''}`}
                          onClick={() => skipHabit(habitId)}
                          title="Skip habit (freezes streak)"
                        >
                          ⏸ Skip
                        </button>
                        <button
                          type="button"
                          className={`chk-btn ${isMiss ? 'active missed' : ''}`}
                          onClick={() => missHabit(habitId)}
                          title="Mark missed"
                        >
                          ✗ Miss
                        </button>
                        {(isDone || isSkip || isMiss) && (
                          <button
                            type="button"
                            className="chk-btn"
                            onClick={() => pendingHabit(habitId)}
                            title="Reset to Pending"
                          >
                            ⏳
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Progress & Quick Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Weekly Progress Card */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '1.35rem',
            boxShadow: 'var(--shadow)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Weekly Consistency
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.35rem', marginBottom: '1rem' }}>
              {daysOfWeek.map((day, idx) => {
                const isCurrent = idx === todayDayIndex;
                const isPast = idx < todayDayIndex;

                return (
                  <div key={day} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: isCurrent ? 'var(--accent)' : 'var(--sub)',
                      marginBottom: '4px'
                    }}>
                      {day}
                    </div>
                    <div style={{
                      height: '32px',
                      borderRadius: '8px',
                      background: isCurrent ? 'var(--accent)' : (isPast ? 'var(--accent-l)' : 'var(--bg)'),
                      border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                      display: 'grid',
                      placeItems: 'center',
                      color: isCurrent ? '#fff' : (isPast ? 'var(--accent)' : 'var(--muted)'),
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {isPast ? '✓' : isCurrent ? `${doneCount}` : '·'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--sub)', lineHeight: 1.45 }}>
              Maintain consistency to preserve momentum and unlock the <strong>7-Day Streak Badge</strong> (+50 XP).
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '1.35rem',
            boxShadow: 'var(--shadow)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Productivity Shortcuts
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-s"
                onClick={() => setActiveTab('calendar')}
                style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Heatmap Calendar
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn-s"
                onClick={() => setActiveTab('goals')}
                style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={16} /> Goal Milestones
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn-s"
                onClick={() => setActiveTab('analytics')}
                style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} /> Performance Charts
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Habit Details Modal */}
      {selectedHabitForDetail && (
        <HabitDetailModal
          habit={selectedHabitForDetail}
          isOpen={!!selectedHabitForDetail}
          onClose={() => setSelectedHabitForDetail(null)}
          onCheckin={checkinHabit}
          onSkip={skipHabit}
          onMiss={missHabit}
          onPending={pendingHabit}
          onEdit={(h) => {
            setSelectedHabitForDetail(null);
            // Open edit modal
            if (editHabit) editHabit(h);
          }}
          onDuplicate={duplicateHabit}
          onPauseToggle={pauseToggleHabit}
          onArchiveToggle={archiveHabit}
          onDelete={deleteHabit}
        />
      )}
    </div>
  );
}
