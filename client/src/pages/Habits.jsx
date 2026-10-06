import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'
];

const POPULAR_EMOJIS = ['⭐', '🏃', '📚', '💧', '🧘', '💪', '🌿', '🍎', '🌙', '✍️', '🚴', '🎯'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Habits({ habits = [], checkinHabit, skipHabit, addHabit, editHabit, archiveHabit, deleteHabit }) {
  const [activeSubtab, setActiveSubtab] = useState('active'); // 'active' or 'archived'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [hTitle, setHTitle] = useState('');
  const [hDesc, setHDesc] = useState('');
  const [hIcon, setHIcon] = useState('⭐');
  const [hCat, setHCat] = useState('Health');
  const [hFreq, setHFreq] = useState('Daily');
  const [hPriority, setHPriority] = useState('Medium');
  const [hColor, setHColor] = useState('#10b981');
  const [hScheduledDays, setHScheduledDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [hReminderTime, setHReminderTime] = useState('08:00');
  const [hReminderEnabled, setHReminderEnabled] = useState(true);
  const [hTarget, setHTarget] = useState(30);

  const resetForm = () => {
    setEditingId(null);
    setHTitle('');
    setHDesc('');
    setHIcon('⭐');
    setHCat('Health');
    setHFreq('Daily');
    setHPriority('Medium');
    setHColor('#10b981');
    setHScheduledDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setHReminderTime('08:00');
    setHReminderEnabled(true);
    setHTarget(30);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (habit) => {
    setEditingId(habit._id);
    setHTitle(habit.title || '');
    setHDesc(habit.description || '');
    setHIcon(habit.icon || '⭐');
    setHCat(habit.category || 'Health');
    setHFreq(habit.frequency || 'Daily');
    setHPriority(habit.priority || 'Medium');
    setHColor(habit.color || '#10b981');
    setHScheduledDays(habit.scheduledDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setHReminderTime(habit.reminderTime || '08:00');
    setHReminderEnabled(habit.reminderEnabled !== false);
    setHTarget(habit.target || 30);
    setIsModalOpen(true);
  };

  const toggleScheduledDay = (day) => {
    if (hScheduledDays.includes(day)) {
      if (hScheduledDays.length > 1) {
        setHScheduledDays(hScheduledDays.filter(d => d !== day));
      }
    } else {
      setHScheduledDays([...hScheduledDays, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hTitle.trim()) return;

    const payload = {
      title: hTitle.trim(),
      description: hDesc.trim(),
      category: hCat,
      icon: hIcon || '⭐',
      frequency: hFreq,
      priority: hPriority,
      color: hColor,
      scheduledDays: hScheduledDays,
      reminderTime: hReminderTime,
      reminderEnabled: hReminderEnabled,
      target: parseInt(hTarget) || 30
    };

    let success = false;
    if (editingId) {
      success = await editHabit(editingId, payload);
    } else {
      success = await addHabit(payload);
    }

    if (success) {
      resetForm();
      setIsModalOpen(false);
    }
  };

  const todayISO = new Date().toISOString().slice(0, 10);
  const isDoneToday = (h) => {
    return h.completedDates && h.completedDates.some(d => d.slice(0, 10) === todayISO);
  };

  const isSkippedToday = (h) => {
    return h.skippedDates && h.skippedDates.some(d => d.slice(0, 10) === todayISO);
  };

  // Filter Active vs Archived
  const activeHabitsList = habits.filter(h => !h.isArchived);
  const archivedHabitsList = habits.filter(h => h.isArchived);

  const displayedList = activeSubtab === 'active' ? activeHabitsList : archivedHabitsList;

  // Filter Categories & Priority & Search
  const categoriesList = ['All', ...new Set(habits.map(h => h.category))];
  const filteredHabits = displayedList.filter(h => {
    const matchesCat = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || (h.priority || 'Medium') === selectedPriority;
    const matchesSearch = !searchQuery || 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesPriority && matchesSearch;
  });

  const doneCount = activeHabitsList.filter(isDoneToday).length;
  const totalCount = activeHabitsList.length;
  const completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="page on">
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">My Habits</div>
          <div className="pg-sub">Manage, customize, and maintain your daily commitments</div>
        </div>
        <div className="tb-right">
          <button className="btn sm" onClick={openCreateModal}>
            + New Habit
          </button>
        </div>
      </div>

      {/* Subtab bar: Active vs Archived */}
      <div className="subtab-bar">
        <button
          className={`subtab-btn ${activeSubtab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('active')}
        >
          Active Habits ({activeHabitsList.length})
        </button>
        <button
          className={`subtab-btn ${activeSubtab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('archived')}
        >
          📦 Archived Habits ({archivedHabitsList.length})
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <input
          placeholder="🔍 Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '180px',
            border: '1.5px solid var(--border)',
            borderRadius: '8px',
            padding: '7px 12px',
            fontSize: '0.82rem',
            background: 'var(--card)',
            color: 'var(--text)'
          }}
        />

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: '8px',
            padding: '7px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: 'var(--card)',
            color: 'var(--text)'
          }}
        >
          <option value="All">All Priorities</option>
          <option value="High">🔴 High Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="Low">🔵 Low Priority</option>
        </select>
      </div>

      {/* Categories chips filter */}
      <div className="chips">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            className={`chip ${selectedCategory === cat ? 'on' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} ({cat === 'All' ? displayedList.length : displayedList.filter(h => h.category === cat).length})
          </button>
        ))}
      </div>

      {/* Habits list */}
      <div id="habList">
        {filteredHabits.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--sub)' }}>
            <span style={{ fontSize: '2.2rem' }}>🌿</span>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>No habits found matching your filter.</p>
            {activeSubtab === 'active' && (
              <button className="btn sm" style={{ margin: '0.8rem auto 0', width: 'auto' }} onClick={openCreateModal}>
                + Create Your First Habit
              </button>
            )}
          </div>
        ) : (
          filteredHabits.map((h) => {
            const done = isDoneToday(h);
            const skipped = isSkippedToday(h);
            const streakPct = Math.min(100, Math.round((h.streak / (h.target || 30)) * 100));
            const habitColor = h.color || '#10b981';
            const scheduledDays = h.scheduledDays || WEEKDAYS;

            return (
              <div key={h._id} className={`hr ${done ? 'done' : ''}`} style={{ borderLeft: `4px solid ${habitColor}` }}>
                {/* Icon */}
                <div
                  className="h-em"
                  style={{
                    background: `${habitColor}18`,
                    color: habitColor,
                    borderColor: `${habitColor}33`,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {h.icon || '⭐'}
                </div>

                {/* Details */}
                <div className="h-bd">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <span className="h-nm">{h.title}</span>
                    <span className={`priority-tag ${(h.priority || 'medium').toLowerCase()}`}>
                      {h.priority || 'Medium'}
                    </span>
                    {h.reminderTime && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--sub)', background: 'var(--bg)', padding: '1px 6px', borderRadius: '5px' }}>
                        ⏰ {h.reminderTime} {h.reminderEnabled ? '🔔' : '🔕'}
                      </span>
                    )}
                  </div>

                  {h.description && (
                    <div className="habit-desc">{h.description}</div>
                  )}

                  <div className="h-mt" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '3px' }}>
                    <span>{h.category} · {h.frequency || 'Daily'} · Target: {h.target || 30}d</span>
                    
                    {/* Days badges */}
                    <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px' }}>
                      {WEEKDAYS.map((d) => (
                        <span
                          key={d}
                          className={`day-badge ${scheduledDays.includes(d) ? 'active' : ''}`}
                          style={scheduledDays.includes(d) ? { background: habitColor } : {}}
                        >
                          {d[0]}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '4px' }}>
                    <span className="spill">🔥 {h.streak} day streak</span>
                    {h.longestStreak > 0 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>
                        Best: {h.longestStreak}d
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '5px' }}>
                    <div className="pb" style={{ height: '4px', width: '130px' }}>
                      <div
                        className="pf"
                        style={{
                          background: habitColor,
                          width: `${streakPct}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
                  {/* Edit button */}
                  <button
                    onClick={() => openEditModal(h)}
                    className="del"
                    style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    title="Edit habit"
                  >
                    ✏️
                  </button>

                  {/* Archive button */}
                  <button
                    onClick={() => archiveHabit(h._id)}
                    className="del"
                    style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
                    title={h.isArchived ? 'Unarchive habit' : 'Archive habit'}
                  >
                    {h.isArchived ? '📂' : '📦'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteHabit(h._id)}
                    className="del"
                    style={{ background: '#fef2f2' }}
                    title="Delete habit"
                  >
                    ✕
                  </button>

                  {/* Skip button */}
                  {!h.isArchived && (
                    <button
                      className="del"
                      style={{
                        background: skipped ? '#fef3c7' : 'var(--bg)',
                        color: '#d97706',
                        border: '1px solid var(--border)',
                        width: '32px',
                        height: '32px'
                      }}
                      onClick={() => skipHabit && skipHabit(h._id)}
                      disabled={skipped || done}
                      title={skipped ? 'Skipped today' : 'Skip for today'}
                    >
                      ⏭
                    </button>
                  )}

                  {/* Checkin button */}
                  {!h.isArchived && (
                    <button
                      className={`chk ${done ? 'done' : ''}`}
                      onClick={() => checkinHabit(h._id)}
                      disabled={done}
                      title={done ? 'Completed today' : 'Mark completed'}
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Today's completions progress bar */}
      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: 'var(--sub)', marginBottom: '0.38rem' }}>
          <span>TODAY'S ACTIVE COMPLETIONS</span>
          <span style={{ color: 'var(--accent)' }}>{completionRate}%</span>
        </div>
        <div className="pb" style={{ height: '9px' }}>
          <div
            className="pf"
            style={{
              background: completionRate === 100 ? '#16a34a' : 'var(--accent)',
              width: `${completionRate}%`
            }}
          />
        </div>
      </div>

      {/* Modal Overlay for Add / Edit Habit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="mt">{editingId ? '✏️ Edit Habit' : '➕ New Habit'}</div>
            <form onSubmit={handleSubmit}>
              {/* Habit Name & Icon */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Habit Name</label>
                  <input
                    placeholder="e.g. Morning 5km Run"
                    value={hTitle}
                    onChange={(e) => setHTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="field" style={{ width: '75px' }}>
                  <label>Emoji</label>
                  <input
                    value={hIcon}
                    onChange={(e) => setHIcon(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                  />
                </div>
              </div>

              {/* Popular Emoji quick picks */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setHIcon(emoji)}
                    style={{
                      background: hIcon === emoji ? 'var(--accent-l)' : 'none',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Habit Description */}
              <div className="field">
                <label>Description / Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Drink before having coffee; stretch afterwards."
                  value={hDesc}
                  onChange={(e) => setHDesc(e.target.value)}
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

              {/* Category & Priority */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select value={hCat} onChange={(e) => setHCat(e.target.value)}>
                    <option>Health</option>
                    <option>Study</option>
                    <option>Fitness</option>
                    <option>Mindfulness</option>
                    <option>Social</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Priority</label>
                  <select value={hPriority} onChange={(e) => setHPriority(e.target.value)}>
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Accent Color picker */}
              <div className="field">
                <label>Accent Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {PRESET_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-dot ${hColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setHColor(c)}
                    />
                  ))}
                  <input
                    type="color"
                    value={hColor}
                    onChange={(e) => setHColor(e.target.value)}
                    style={{ width: '28px', height: '28px', padding: 0, border: 'none', cursor: 'pointer', background: 'none' }}
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Scheduled Days */}
              <div className="field">
                <label>Scheduled Days</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {WEEKDAYS.map((day) => {
                    const isSelected = hScheduledDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleScheduledDay(day)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: isSelected ? hColor : 'var(--card)',
                          color: isSelected ? '#fff' : 'var(--sub)'
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Frequency, Reminder & Target */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Frequency</label>
                  <select value={hFreq} onChange={(e) => setHFreq(e.target.value)}>
                    <option>Daily</option>
                    <option>Weekdays only</option>
                    <option>Weekends</option>
                  </select>
                </div>
                <div className="field" style={{ width: '85px' }}>
                  <label>Target (days)</label>
                  <input
                    type="number"
                    value={hTarget}
                    onChange={(e) => setHTarget(e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>
              </div>

              {/* Persistent Reminder settings */}
              <div className="field" style={{ background: 'var(--bg)', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ margin: 0 }}>⏰ Daily Reminder</label>
                  <label className="sw" style={{ transform: 'scale(0.85)' }}>
                    <input
                      type="checkbox"
                      checked={hReminderEnabled}
                      onChange={(e) => setHReminderEnabled(e.target.checked)}
                    />
                    <span className="sw-sl" />
                  </label>
                </div>
                {hReminderEnabled && (
                  <div style={{ marginTop: '0.45rem' }}>
                    <input
                      type="time"
                      value={hReminderTime}
                      onChange={(e) => setHReminderTime(e.target.value)}
                      style={{ padding: '6px 8px', fontSize: '0.84rem' }}
                    />
                  </div>
                )}
              </div>

              <div className="mrow">
                <button type="submit" className="btn">
                  {editingId ? 'Save Changes' : 'Create Habit'}
                </button>
                <button
                  type="button"
                  className="btn outline"
                  style={{ width: 'auto', padding: '11px 18px' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Habits;
