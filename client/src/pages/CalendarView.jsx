import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon, Flame, Trophy, CheckCircle,
  TrendingUp, Sparkles, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import DayInspectorModal from '../components/DayInspectorModal';

export default function CalendarView({ habits = [], checkinHabit, skipHabit, missHabit, pendingHabit }) {
  const { fetchWithAuth } = useAuth();
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHabitFilter, setSelectedHabitFilter] = useState('All');
  const [selectedDayModal, setSelectedDayModal] = useState(null);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data);
      }
    } catch (err) {
      console.error('Failed to load calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [habits]);

  // Compute 52 weeks (364/365 days)
  const days = calendarData?.days || [];

  // Filter by habit if selected
  const displayDays = days.map(d => {
    if (selectedHabitFilter === 'All') {
      return d;
    }
    const habitMatch = (d.habits || []).filter(h => String(h.id) === String(selectedHabitFilter));
    const completedCount = habitMatch.filter(h => h.status === 'completed').length;
    const skippedCount = habitMatch.filter(h => h.status === 'skipped').length;
    const missedCount = habitMatch.filter(h => h.status === 'missed').length;
    return {
      ...d,
      completedCount,
      skippedCount,
      missedCount,
      habits: habitMatch
    };
  });

  const getHeatClass = (count) => {
    if (!count || count === 0) return 'heat-0';
    if (count <= 2) return 'heat-1';
    if (count <= 4) return 'heat-2';
    if (count <= 6) return 'heat-3';
    return 'heat-4';
  };

  const totalCompletions = displayDays.reduce((acc, d) => acc + (d.completedCount || 0), 0);
  const activeDays = displayDays.filter(d => (d.completedCount || 0) > 0).length;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="page on">
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">GitHub-Style Contribution Heatmap</div>
          <div className="pg-sub">
            Visualize your consistency matrix across 365 days. Click any date to inspect habits.
          </div>
        </div>

        {/* Habit Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <select
            value={selectedHabitFilter}
            onChange={(e) => setSelectedHabitFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '0.84rem',
              fontWeight: 700
            }}
          >
            <option value="All">All Habits Combined</option>
            {habits.map(h => (
              <option key={h._id || h.id} value={h._id || h.id}>
                {h.icon} {h.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid g4" style={{ marginBottom: '1.5rem' }}>
        <div className="sc">
          <div className="sc-lbl">Active Streak 🔥</div>
          <div className="sc-val" style={{ color: '#f59e0b' }}>
            {calendarData?.currentStreak || 0}d
          </div>
          <div className="sc-sub">Consecutive days active</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Best Streak 🏆</div>
          <div className="sc-val" style={{ color: '#8b5cf6' }}>
            {calendarData?.bestStreak || 0}d
          </div>
          <div className="sc-sub">All-time record</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Total Check-ins</div>
          <div className="sc-val" style={{ color: 'var(--accent)' }}>
            {totalCompletions}
          </div>
          <div className="sc-sub">Completions recorded</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Active Days</div>
          <div className="sc-val" style={{ color: '#3b82f6' }}>
            {activeDays} <span style={{ fontSize: '0.9rem', color: 'var(--sub)' }}>/ 365</span>
          </div>
          <div className="sc-sub">{Math.round((activeDays / 365) * 100)}% annual consistency</div>
        </div>
      </div>

      {/* Heatmap Card */}
      <div className="calendar-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CalendarIcon size={18} color="var(--accent)" />
            Annual Activity Matrix ({selectedHabitFilter === 'All' ? 'All Habits' : habits.find(h => String(h._id || h.id) === String(selectedHabitFilter))?.title || 'Habit'})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--sub)' }}>
            Last 52 Weeks
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="heatmap-scroll">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Weekday labels */}
            <div style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 13px)',
              gap: '3.5px',
              fontSize: '0.65rem',
              color: 'var(--sub)',
              fontWeight: 700,
              paddingTop: '2px',
              textAlign: 'right',
              width: '26px'
            }}>
              <div>Mon</div>
              <div></div>
              <div>Wed</div>
              <div></div>
              <div>Fri</div>
              <div></div>
              <div>Sun</div>
            </div>

            {/* Matrix */}
            <div className="heatmap-grid">
              {displayDays.map((day) => {
                const count = day.completedCount || 0;
                return (
                  <div
                    key={day.date}
                    className={`heatmap-cell ${getHeatClass(count)}`}
                    title={`${day.date}: ${count} habit${count === 1 ? '' : 's'} completed`}
                    onClick={() => setSelectedDayModal(day)}
                  />
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="heatmap-cell heat-0" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heat-1" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heat-2" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heat-3" style={{ width: '11px', height: '11px' }} />
            <div className="heatmap-cell heat-4" style={{ width: '11px', height: '11px' }} />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Grid */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>
          Monthly Snapshot
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {monthNames.map((m, idx) => {
            // Count completions in this month
            const monthStr = String(idx + 1).padStart(2, '0');
            const monthDays = displayDays.filter(d => d.date.slice(5, 7) === monthStr);
            const mTotal = monthDays.reduce((acc, d) => acc + (d.completedCount || 0), 0);
            const mActive = monthDays.filter(d => (d.completedCount || 0) > 0).length;

            return (
              <div
                key={m}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  boxShadow: 'var(--shadow)'
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)' }}>{m}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: mTotal > 0 ? 'var(--accent)' : 'var(--muted)', marginTop: '2px' }}>
                  {mTotal}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>
                  {mActive} active days
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspector Modal */}
      {selectedDayModal && (
        <DayInspectorModal
          isOpen={!!selectedDayModal}
          onClose={() => setSelectedDayModal(null)}
          selectedDayData={selectedDayModal}
          habits={habits}
          onCheckin={checkinHabit}
          onSkip={skipHabit}
          onMiss={missHabit}
          onPending={pendingHabit}
        />
      )}
    </div>
  );
}
