import React from 'react';
import { X, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function DayInspectorModal({
  isOpen,
  onClose,
  selectedDayData,
  habits,
  onCheckin,
  onSkip,
  onMiss,
  onPending
}) {
  if (!isOpen || !selectedDayData) return null;

  const { date, completedCount, missedCount, skippedCount, habits: dayHabitsList } = selectedDayData;

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Calendar size={20} color="var(--accent)" />
            {formattedDate}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Day Metric Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div style={{
              background: 'var(--accent-l)',
              border: '1px solid var(--accent)',
              borderRadius: '12px',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>
                Completed
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--accent)', marginTop: '2px' }}>
                {completedCount || 0}
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>
                Skipped
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                {skippedCount || 0}
              </div>
            </div>

            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                Missed
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>
                {missedCount || 0}
              </div>
            </div>
          </div>

          {/* Habits Breakdown for this Day */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--sub)',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
              letterSpacing: '0.04em'
            }}>
              Habit Records for this Date
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '320px', overflowY: 'auto' }}>
              {habits.map((habit) => {
                const habitId = habit._id || habit.id;
                const isCompleted = habit.completedDates && habit.completedDates.some(d => d.slice(0, 10) === date);
                const isSkipped = habit.skippedDates && habit.skippedDates.some(d => d.slice(0, 10) === date);
                const isMissed = habit.missedDates && habit.missedDates.some(d => d.slice(0, 10) === date);

                return (
                  <div
                    key={habitId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.95rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{habit.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)' }}>
                          {habit.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>
                          {habit.category} · Priority: {habit.priority}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ✓ Completed
                        </span>
                      ) : isSkipped ? (
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ⏸ Skipped
                        </span>
                      ) : isMissed ? (
                        <span style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ✗ Missed
                        </span>
                      ) : (
                        <span style={{
                          background: 'var(--bg)',
                          color: 'var(--muted)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: '1px solid var(--border)'
                        }}>
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-p" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
