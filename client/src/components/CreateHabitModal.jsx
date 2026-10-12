import React, { useState, useEffect } from 'react';
import { X, Sparkles, Bell, Calendar, Tag, Check, Palette } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { name: 'Study', icon: '📚' },
  { name: 'Fitness', icon: '💪' },
  { name: 'Mindfulness', icon: '🧘' },
  { name: 'Health', icon: '💧' },
  { name: 'Coding', icon: '💻' },
  { name: 'Reading', icon: '📖' },
  { name: 'Sleep', icon: '😴' },
  { name: 'Nutrition', icon: '🥗' },
  { name: 'Finance', icon: '💰' },
  { name: 'Personal Development', icon: '🎯' },
];

const PRESET_ICONS = ['💻', '📚', '💪', '💧', '🧘', '📖', '😴', '🥗', '💰', '🎯', '⭐', '⚡', '🏃', '🍎', '🎨', '🎸', '✍️', '🌱'];

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1'
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CreateHabitModal({ isOpen, onClose, onSave, editingHabit = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [icon, setIcon] = useState('💻');
  const [color, setColor] = useState('#10b981');
  const [frequency, setFrequency] = useState('Daily');
  const [scheduledDays, setScheduledDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [priority, setPriority] = useState('High');
  const [target, setTarget] = useState(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState('');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title || '');
      setDescription(editingHabit.description || '');
      const isKnown = DEFAULT_CATEGORIES.some(c => c.name === editingHabit.category);
      if (isKnown) {
        setCategory(editingHabit.category);
        setIsCustomCategory(false);
      } else {
        setCategory('Custom');
        setCustomCategory(editingHabit.category || '');
        setIsCustomCategory(true);
      }
      setIcon(editingHabit.icon || '⭐');
      setColor(editingHabit.color || '#10b981');
      setFrequency(editingHabit.frequency || 'Daily');
      setScheduledDays(editingHabit.scheduledDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setPriority(editingHabit.priority || 'Medium');
      setTarget(editingHabit.target || 30);
      setStartDate(editingHabit.startDate || new Date().toISOString().slice(0, 10));
      setTargetDate(editingHabit.targetDate || '');
      setReminderTime(editingHabit.reminderTime || '08:00');
      setReminderEnabled(editingHabit.reminderEnabled !== false);
      setStatus(editingHabit.status || 'active');
    } else {
      // Reset defaults
      setTitle('');
      setDescription('');
      setCategory('Coding');
      setCustomCategory('');
      setIsCustomCategory(false);
      setIcon('💻');
      setColor('#10b981');
      setFrequency('Daily');
      setScheduledDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setPriority('High');
      setTarget(30);
      setStartDate(new Date().toISOString().slice(0, 10));
      setTargetDate('');
      setReminderTime('08:00');
      setReminderEnabled(true);
      setStatus('active');
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    if (scheduledDays.includes(day)) {
      if (scheduledDays.length > 1) {
        setScheduledDays(scheduledDays.filter(d => d !== day));
      }
    } else {
      setScheduledDays([...scheduledDays, day]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = isCustomCategory && customCategory.trim() ? customCategory.trim() : category;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      icon,
      color,
      frequency,
      scheduledDays,
      priority,
      target: parseInt(target) || 30,
      startDate,
      targetDate,
      reminderTime,
      reminderEnabled,
      status
    };

    onSave(payload, editingHabit ? editingHabit._id || editingHabit.id : null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Sparkles size={22} color="var(--accent)" />
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title & Description */}
            <div className="field">
              <label>Habit Name *</label>
              <input
                type="text"
                placeholder="e.g. Deep Work & Coding Practice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Description / Routine Notes</label>
              <input
                type="text"
                placeholder="e.g. 45 minutes focused session before checking emails"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category Selector */}
            <div className="field">
              <label>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.35rem' }}>
                {DEFAULT_CATEGORIES.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setCategory(c.name);
                      setIsCustomCategory(false);
                      setIcon(c.icon);
                    }}
                    style={{
                      background: !isCustomCategory && category === c.name ? 'var(--accent-l)' : 'var(--surface)',
                      color: !isCustomCategory && category === c.name ? 'var(--accent)' : 'var(--sub)',
                      border: !isCustomCategory && category === c.name ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(true)}
                  style={{
                    background: isCustomCategory ? 'var(--accent-l)' : 'var(--surface)',
                    color: isCustomCategory ? 'var(--accent)' : 'var(--sub)',
                    border: isCustomCategory ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✨ Custom Category
                </button>
              </div>

              {isCustomCategory && (
                <div style={{ marginTop: '0.6rem' }}>
                  <input
                    type="text"
                    placeholder="Enter custom category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required={isCustomCategory}
                  />
                </div>
              )}
            </div>

            {/* Icon & Color Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="field">
                <label>Icon / Emoji</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {PRESET_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: icon === ic ? 'var(--accent-l)' : 'var(--surface)',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'grid',
                        placeItems: 'center'
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Accent Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        border: color === c ? '3px solid var(--text)' : '2px solid transparent',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff'
                      }}
                    >
                      {color === c && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequency & Scheduled Days */}
            <div className="field">
              <label>Tracking Frequency</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="Daily">Daily (Every Day)</option>
                <option value="Specific Days">Specific Weekdays</option>
                <option value="3 times / week">Weekly (3 times / week)</option>
                <option value="5 times / week">Weekly (5 times / week)</option>
                <option value="10 times / month">Monthly (10 times / month)</option>
                <option value="20 times / month">Monthly (20 times / month)</option>
                <option value="Custom">Custom Schedule</option>
              </select>

              {(frequency === 'Daily' || frequency === 'Specific Days' || frequency === 'Custom') && (
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem' }}>
                  {WEEKDAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: scheduledDays.includes(day) ? '1px solid var(--accent)' : '1px solid var(--border)',
                        background: scheduledDays.includes(day) ? 'var(--accent)' : 'var(--bg)',
                        color: scheduledDays.includes(day) ? '#fff' : 'var(--sub)',
                        cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority, Target & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🔵 Low</option>
                </select>
              </div>

              <div className="field">
                <label>Target Goal (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Reminders & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Daily Reminder Time</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={!reminderEnabled}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, textTransform: 'none', fontSize: '0.8rem' }}>
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Alert
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Target Deadline (Optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-s" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-p">
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
