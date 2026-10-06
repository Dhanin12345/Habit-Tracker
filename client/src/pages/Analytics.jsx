import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const CATEGORY_COLORS = {
  Health:      '#10b981',
  Study:       '#8b5cf6',
  Fitness:     '#f59e0b',
  Mindfulness: '#ec4899',
  Social:      '#06b6d4',
  Custom:      '#3b82f6',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Analytics({ habits = [], darkMode = false }) {
  const [period, setPeriod] = useState('This Week');
  const weeklyRef   = useRef(null);
  const categoryRef = useRef(null);
  const streakRef   = useRef(null);
  const instances   = useRef({});

  const tc          = darkMode ? '#9ca3af' : '#6b7280';
  const gc          = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const accentSolid = darkMode ? '#34d399' : '#059669';
  const accentFade  = darkMode ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.3)';

  // Aggregate stats
  const todayISO         = new Date().toISOString().slice(0, 10);
  const activeHabits     = habits.filter(h => !h.isArchived);
  const doneToday        = activeHabits.filter(h =>
    (h.completedDates || []).some(d => d.slice(0, 10) === todayISO)
  ).length;
  const todayPct         = activeHabits.length ? Math.round((doneToday / activeHabits.length) * 100) : 0;
  const bestStreak       = habits.length ? Math.max(0, ...habits.map(h => h.streak || 0)) : 0;
  const totalStreakDays   = activeHabits.reduce((a, h) => a + (h.streak || 0), 0);
  const totalCompletions  = habits.reduce((a, h) => a + (h.completedDates?.length || 0), 0);

  // Category counts and percentages
  const catCounts = {};
  habits.forEach(h => {
    catCounts[h.category] = (catCounts[h.category] || 0) + 1;
  });
  const catLabels = Object.keys(catCounts);
  const catData   = catLabels.map(l => catCounts[l]);
  const catColors = catLabels.map(l => CATEGORY_COLORS[l] || '#3b82f6');
  const totalHabitsCount = habits.length;

  // Best performing habit
  const topHabit = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];

  // Destroy previous chart instances
  const destroy = (key) => {
    if (instances.current[key]) {
      instances.current[key].destroy();
      delete instances.current[key];
    }
  };

  useEffect(() => {
    // 1. WEEKLY COMPLETIONS BAR CHART
    const weekLabels = [];
    const weekData   = [];
    let weekTotal    = 0;

    for (let i = 6; i >= 0; i--) {
      const d   = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const cnt = habits.reduce((acc, h) =>
        acc + ((h.completedDates || []).filter(dt => dt.slice(0, 10) === iso).length), 0);
      weekLabels.push(DAY_NAMES[(d.getDay() + 6) % 7]);
      weekData.push(cnt);
      weekTotal += cnt;
    }

    if (weeklyRef.current) {
      destroy('weekly');
      instances.current.weekly = new Chart(weeklyRef.current, {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Completions',
            data: weekData,
            backgroundColor: weekData.map((v, i) =>
              i === weekData.length - 1 ? accentSolid : (v > 0 ? accentFade : (darkMode ? '#1f2937' : '#f3f4f6'))),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 32,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: darkMode ? '#1f2937' : '#111827',
              padding: 8,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} habit(s) completed`,
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: tc, stepSize: 1, font: { size: 10, family: 'Inter' } },
              grid: { color: gc },
            },
            x: {
              ticks: { color: tc, font: { size: 11, family: 'Inter', weight: 600 } },
              grid: { display: false },
            },
          },
        },
      });
    }

    // 2. CATEGORY DOUGHNUT CHART (COMPACT & PROPORTIONAL)
    if (categoryRef.current) {
      destroy('category');
      instances.current.category = new Chart(categoryRef.current, {
        type: 'doughnut',
        data: {
          labels: catLabels.length ? catLabels : ['None'],
          datasets: [{
            data: catData.length ? catData : [1],
            backgroundColor: catColors.length ? catColors : ['#e5e7eb'],
            borderWidth: 3,
            borderColor: darkMode ? '#162019' : '#ffffff',
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: darkMode ? '#1f2937' : '#111827',
              padding: 8,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${ctx.raw} habit(s)`,
              }
            }
          },
        },
      });
    }

    // 3. STREAKS HORIZONTAL BAR CHART
    const strLabels = habits.slice(0, 6).map(h => `${h.icon || '⭐'} ${(h.title || '').slice(0, 16)}`);
    const strData   = habits.slice(0, 6).map(h => h.streak || 0);
    const strColors = habits.slice(0, 6).map(h => (h.color || CATEGORY_COLORS[h.category] || '#3b82f6'));

    if (streakRef.current && strLabels.length) {
      destroy('streak');
      instances.current.streak = new Chart(streakRef.current, {
        type: 'bar',
        data: {
          labels: strLabels,
          datasets: [{
            data: strData,
            backgroundColor: strColors,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 18,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: darkMode ? '#1f2937' : '#111827',
              padding: 8,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => ` Streak: ${ctx.parsed.x} consecutive days`,
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { color: tc, stepSize: 1, font: { size: 10 } },
              grid: { color: gc },
            },
            y: {
              ticks: { color: tc, font: { size: 11, weight: 600 } },
              grid: { display: false },
            },
          },
        },
      });
    }

    return () => {
      ['weekly', 'category', 'streak'].forEach(destroy);
    };
  }, [habits, darkMode, period]);

  return (
    <div className="page on">
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Analytics & Visual Insights</div>
          <div className="pg-sub">Visual performance metrics, completion rates, and habit distribution</div>
        </div>
        <div className="tb-right">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{
              border: '1.5px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              font: '600 0.8rem Inter, sans-serif',
              color: 'var(--text)',
              background: 'var(--card)',
              cursor: 'pointer'
            }}
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="g4" style={{ marginBottom: '1.25rem' }}>
        <div className="sc">
          <div className="sc-ic" style={{ background: '#ecfdf5' }}>🎯</div>
          <div className="sc-v" style={{ color: 'var(--accent)' }}>{todayPct}%</div>
          <div className="sc-l">Today's Completion</div>
          <div className="sc-d up">{doneToday} of {activeHabits.length} habits done</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#fff7ed' }}>🔥</div>
          <div className="sc-v" style={{ color: '#f97316' }}>{bestStreak}</div>
          <div className="sc-l">Best Streak</div>
          <div className="sc-d" style={{ color: '#f97316' }}>days consecutive</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#eff6ff' }}>⚡</div>
          <div className="sc-v" style={{ color: '#3b82f6' }}>{totalStreakDays}</div>
          <div className="sc-l">Total Active Days</div>
          <div className="sc-d">Cumulative streak momentum</div>
        </div>

        <div className="sc">
          <div className="sc-ic" style={{ background: '#ede9fe' }}>🏅</div>
          <div className="sc-v" style={{ color: '#8b5cf6' }}>{totalCompletions}</div>
          <div className="sc-l">Total Check-ins</div>
          <div className="sc-d up">All-time completions</div>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--sub)' }}>
          <div style={{ fontSize: '2.5rem' }}>📊</div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', fontWeight: 700 }}>No Habit Data Available</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>
            Create habits and record daily check-ins to unlock rich charts and visual analytics!
          </p>
        </div>
      ) : (
        <>
          {/* Main 2-Column Graph Grid */}
          <div className="g2" style={{ marginBottom: '1.25rem' }}>
            {/* Weekly Velocity Card */}
            <div className="cc" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div className="cc-t" style={{ margin: 0 }}>📅 7-Day Completion Velocity</div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--sub)', fontWeight: 600 }}>Daily Activity</span>
                </div>
                <div style={{ position: 'relative', height: '190px', width: '100%' }}>
                  <canvas ref={weeklyRef} />
                </div>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--sub)', borderTop: '1px solid var(--border)', paddingTop: '0.65rem', marginTop: '0.65rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Past 7 Days Tracking</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Active Routines</span>
              </div>
            </div>

            {/* Category Breakdown Card (Balanced & Proportional) */}
            <div className="cc" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div className="cc-t" style={{ margin: 0 }}>🎨 Category Distribution</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--sub)', fontWeight: 600 }}>
                  {catLabels.length} {catLabels.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>

              {/* Centered Compact Doughnut with Center Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', padding: '0.4rem 0' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
                  <canvas ref={categoryRef} />
                  {/* Center Text Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                      {totalHabitsCount}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {totalHabitsCount === 1 ? 'Habit' : 'Habits'}
                    </div>
                  </div>
                </div>

                {/* Category Legend List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: '130px' }}>
                  {catLabels.map((cat, idx) => {
                    const count = catCounts[cat];
                    const pct = totalHabitsCount > 0 ? Math.round((count / totalHabitsCount) * 100) : 0;
                    return (
                      <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '9px',
                              height: '9px',
                              borderRadius: '50%',
                              background: CATEGORY_COLORS[cat] || '#3b82f6',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{cat}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: 'var(--sub)', fontSize: '0.74rem' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ fontSize: '0.73rem', color: 'var(--sub)', borderTop: '1px solid var(--border)', paddingTop: '0.65rem', marginTop: '0.65rem' }}>
                Balanced across your wellness lifestyle domains
              </div>
            </div>
          </div>

          {/* Bottom Card: Habit Streaks Horizontal Comparison */}
          <div className="cc" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div className="cc-t" style={{ margin: 0 }}>🔥 Current Habit Streaks</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--sub)', fontWeight: 600 }}>Top routines by consistency</span>
            </div>
            <div style={{ position: 'relative', height: `${Math.max(140, Math.min(240, habits.length * 36))}px`, width: '100%' }}>
              <canvas ref={streakRef} />
            </div>
          </div>

          {/* Performance Highlights Bar */}
          {topHabit && (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--accent-l)', border: '1.5px solid var(--accent)', padding: '0.9rem 1.15rem' }}>
              <div style={{ fontSize: '1.8rem' }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                  Habit Champion: {topHabit.title}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--sub)', marginTop: '2px' }}>
                  Leading your habit system with an active {topHabit.streak}-day streak ({topHabit.category} category).
                </div>
              </div>
              <span style={{ fontWeight: 900, color: '#f97316', fontSize: '1rem', background: 'var(--card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                🔥 {topHabit.streak} Days
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Analytics;
