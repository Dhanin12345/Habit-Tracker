import React from 'react';
import { X, Flame, Trophy, CheckCircle, Clock, Calendar, Edit3, Copy, Pause, Play, Archive, Trash2, AlertCircle } from 'lucide-react';

export default function HabitDetailModal({
  habit,
  isOpen,
  onClose,
  onCheckin,
  onSkip,
  onMiss,
  onPending,
  onEdit,
  onDuplicate,
  onPauseToggle,
  onArchiveToggle,
  onDelete
}) {
  if (!isOpen || !habit) return null;

  const todayISO = new Date().toISOString().slice(0, 10);
  const isCompletedToday = habit.completedDates && habit.completedDates.some(d => d.slice(0, 10) === todayISO);
  const isSkippedToday = habit.skippedDates && habit.skippedDates.some(d => d.slice(0, 10) === todayISO);
  const isMissedToday = habit.missedDates && habit.missedDates.some(d => d.slice(0, 10) === todayISO);

  const totalCompletions = (habit.completedDates || []).length;
  const totalMissed = (habit.missedDates || []).length;
  const totalAttempts = totalCompletions + totalMissed;
  const completionRate = totalAttempts > 0 ? Math.round((totalCompletions / totalAttempts) * 100) : (totalCompletions > 0 ? 100 : 0);

  // Generate 90-day mini heatmap grid for this habit
  const daysGrid = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const done = habit.completedDates && habit.completedDates.some(x => x.slice(0, 10) === dateStr);
    const skip = habit.skippedDates && habit.skippedDates.some(x => x.slice(0, 10) === dateStr);
    const miss = habit.missedDates && habit.missedDates.some(x => x.slice(0, 10) === dateStr);
    daysGrid.push({ date: dateStr, done, skip, miss });
  }

  // Recent logs
  const logs = [];
  (habit.completedDates || []).slice(-5).forEach(d => logs.push({ type: 'completed', date: d.slice(0, 10) }));
  (habit.skippedDates || []).slice(-3).forEach(d => logs.push({ type: 'skipped', date: d.slice(0, 10) }));
  (habit.missedDates || []).slice(-3).forEach(d => logs.push({ type: 'missed', date: d.slice(0, 10) }));
  logs.sort((a, b) => b.date.localeCompare(a.date));

  const habitId = habit._id || habit.id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottomColor: habit.color || 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '1.6rem',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${habit.color}22`,
              display: 'grid',
              placeItems: 'center'
            }}>
              {habit.icon || '⭐'}
            </span>
            <div>
              <h2>{habit.title}</h2>
              <div style={{ display: 'flex', gap: '0.45rem', marginTop: '3px' }}>
                <span className="chip" style={{ fontSize: '0.7rem' }}>{habit.category}</span>
                <span className={`priority-tag ${habit.priority.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                  {habit.priority}
                </span>
                <span className="chip" style={{ fontSize: '0.7rem', color: habit.status === 'paused' ? 'var(--yellow)' : 'var(--accent)' }}>
                  {habit.status === 'paused' ? '⏸ Paused' : (habit.isArchived ? '📦 Archived' : '⚡ Active')}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {habit.description && (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              fontSize: '0.86rem',
              color: 'var(--sub)',
              lineHeight: 1.5
            }}>
              {habit.description}
            </div>
          )}

          {/* Today's Status Selector */}
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sub)', letterSpacing: '0.04em' }}>
                Today's Status
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                {isCompletedToday ? '✓ Completed Today' : isSkippedToday ? '⏸ Skipped for Today' : isMissedToday ? '✗ Marked Missed' : '⏳ Pending Check-in'}
              </div>
            </div>

            <div className="checkin-btn-group">
              <button
                type="button"
                className={`chk-btn ${isCompletedToday ? 'active completed' : ''}`}
                onClick={() => onCheckin(habitId)}
              >
                ✓ Completed
              </button>
              <button
                type="button"
                className={`chk-btn ${isSkippedToday ? 'active skipped' : ''}`}
                onClick={() => onSkip(habitId)}
              >
                ⏸ Skip
              </button>
              <button
                type="button"
                className={`chk-btn ${isMissedToday ? 'active missed' : ''}`}
                onClick={() => onMiss(habitId)}
              >
                ✗ Missed
              </button>
              {(isCompletedToday || isSkippedToday || isMissedToday) && (
                <button
                  type="button"
                  className="chk-btn"
                  title="Reset status back to Pending"
                  onClick={() => onPending(habitId)}
                >
                  ⏳ Reset
                </button>
              )}
            </div>
          </div>

          {/* Metrics 4-Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div className="sc">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>
                <Flame size={15} /> Streak
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginTop: '4px' }}>
                {habit.streak || 0}d
              </div>
            </div>

            <div className="sc">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 800 }}>
                <Trophy size={15} /> Best
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginTop: '4px' }}>
                {habit.longestStreak || 0}d
              </div>
            </div>

            <div className="sc">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                <CheckCircle size={15} /> Checks
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginTop: '4px' }}>
                {totalCompletions}
              </div>
            </div>

            <div className="sc">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800 }}>
                <Clock size={15} /> Rate
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginTop: '4px' }}>
                {completionRate}%
              </div>
            </div>
          </div>

          {/* 90-Day Habit Heatmap */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              90-Day Contribution Heatmap
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem',
              overflowX: 'auto'
            }}>
              <div style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridTemplateRows: 'repeat(7, 12px)',
                gap: '3px',
                width: 'max-content'
              }}>
                {daysGrid.map((item, idx) => {
                  let bg = 'var(--border)';
                  let opacity = 0.5;
                  if (item.done) {
                    bg = habit.color || '#10b981';
                    opacity = 1;
                  } else if (item.skip) {
                    bg = '#f59e0b';
                    opacity = 0.8;
                  } else if (item.miss) {
                    bg = '#ef4444';
                    opacity = 0.8;
                  }

                  return (
                    <div
                      key={idx}
                      title={`${item.date}: ${item.done ? 'Completed' : item.skip ? 'Skipped' : item.miss ? 'Missed' : 'No Activity'}`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2.5px',
                        background: bg,
                        opacity,
                        cursor: 'pointer'
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', fontSize: '0.7rem', color: 'var(--sub)', marginTop: '0.6rem' }}>
                <span>Missed 🔴</span>
                <span>Skipped 🟡</span>
                <span>Completed 🟢</span>
              </div>
            </div>
          </div>

          {/* Recent History Log */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              Recent Activity Logs
            </div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '0.6rem 0.85rem',
              maxHeight: '140px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '0.82rem', padding: '0.5rem' }}>
                  No recorded check-ins yet. Mark your first check-in above!
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {log.type === 'completed' && <span style={{ color: '#10b981' }}>✓ Completed</span>}
                      {log.type === 'skipped' && <span style={{ color: '#f59e0b' }}>⏸ Skipped</span>}
                      {log.type === 'missed' && <span style={{ color: '#ef4444' }}>✗ Missed</span>}
                    </span>
                    <span style={{ color: 'var(--sub)', fontFamily: 'monospace' }}>{log.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-s"
            style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => {
              if (window.confirm(`Delete habit "${habit.title}" permanently?`)) {
                onDelete(habitId);
                onClose();
              }
            }}
          >
            <Trash2 size={15} /> Delete
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-s"
              onClick={() => {
                onDuplicate(habitId);
                onClose();
              }}
            >
              <Copy size={15} /> Duplicate
            </button>
            <button
              type="button"
              className="btn-s"
              onClick={() => onPauseToggle(habitId)}
            >
              {habit.status === 'paused' ? <Play size={15} /> : <Pause size={15} />}
              {habit.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              className="btn-s"
              onClick={() => onArchiveToggle(habitId)}
            >
              <Archive size={15} /> {habit.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              type="button"
              className="btn-p"
              onClick={() => {
                onClose();
                onEdit(habit);
              }}
            >
              <Edit3 size={15} /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
