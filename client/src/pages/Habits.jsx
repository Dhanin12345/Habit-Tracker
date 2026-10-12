import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Plus, Search, Filter, Flame, Trophy,
  Copy, Pause, Play, Archive, Trash2, Edit3, Download,
  CheckCircle, Clock, Eye
} from 'lucide-react';
import CreateHabitModal from '../components/CreateHabitModal';
import HabitDetailModal from '../components/HabitDetailModal';

const DEFAULT_CATEGORIES = [
  'All', 'Study', 'Fitness', 'Mindfulness', 'Health',
  'Coding', 'Reading', 'Sleep', 'Nutrition', 'Finance', 'Personal Development'
];

export default function Habits({
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
  onOpenCreateHabit
}) {
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all', 'active', 'paused', 'archived'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('streak'); // 'streak', 'title', 'priority'

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [detailHabit, setDetailHabit] = useState(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const isDoneToday = (h) => h.completedDates && h.completedDates.some(d => d.slice(0, 10) === todayISO);
  const isSkippedToday = (h) => h.skippedDates && h.skippedDates.some(d => d.slice(0, 10) === todayISO);
  const isMissedToday = (h) => h.missedDates && h.missedDates.some(d => d.slice(0, 10) === todayISO);

  // Filter List
  const filteredHabits = habits.filter(h => {
    // Status tab filter
    if (activeStatusTab === 'active' && (h.isArchived || h.status === 'paused')) return false;
    if (activeStatusTab === 'paused' && (h.status !== 'paused' || h.isArchived)) return false;
    if (activeStatusTab === 'archived' && !h.isArchived) return false;

    // Category filter
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;

    // Priority filter
    if (selectedPriority !== 'All' && h.priority !== selectedPriority) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title && h.title.toLowerCase().includes(q);
      const matchDesc = h.description && h.description.toLowerCase().includes(q);
      const matchCat = h.category && h.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    return true;
  });

  // Sort
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    if (sortBy === 'streak') {
      return (b.streak || 0) - (a.streak || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'priority') {
      const pWeights = { High: 3, Medium: 2, Low: 1 };
      return (pWeights[b.priority] || 1) - (pWeights[a.priority] || 1);
    }
    return 0;
  });

  const handleSaveHabit = async (payload, id) => {
    if (id) {
      await editHabit(id, payload);
    } else {
      await addHabit(payload);
    }
    setEditingHabit(null);
  };

  const handleExportCSV = () => {
    window.open('/api/habits/export/csv', '_blank');
  };

  const handleExportJSON = () => {
    window.open('/api/habits/export/json', '_blank');
  };

  return (
    <div className="page on">
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Habit Management</div>
          <div className="pg-sub">Organize, customize, and maintain your habits across lifestyle pillars</div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-s"
            onClick={handleExportCSV}
            title="Export CSV of habits"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            className="btn-p"
            onClick={() => {
              setEditingHabit(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} /> New Habit
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="subtab-bar">
        <button
          type="button"
          className={`subtab-btn ${activeStatusTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStatusTab('all')}
        >
          All Habits ({habits.length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeStatusTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveStatusTab('active')}
        >
          ⚡ Active ({habits.filter(h => !h.isArchived && h.status !== 'paused').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeStatusTab === 'paused' ? 'active' : ''}`}
          onClick={() => setActiveStatusTab('paused')}
        >
          ⏸ Paused ({habits.filter(h => h.status === 'paused' && !h.isArchived).length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeStatusTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveStatusTab('archived')}
        >
          📦 Archived ({habits.filter(h => h.isArchived).length})
        </button>
      </div>

      {/* Search, Priority & Sort Bar */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            placeholder="Search habits by name, category, or cue notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '0.85rem'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '11px', top: '12px', color: 'var(--sub)' }} />
        </div>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            border: '1.5px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <option value="All">All Priorities</option>
          <option value="High">🔴 High Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="Low">🔵 Low Priority</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            border: '1.5px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <option value="streak">Sort by Streak (High to Low)</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort Alphabetically</option>
        </select>
      </div>

      {/* Category Pills Filter */}
      <div className="chips" style={{ marginBottom: '1.25rem' }}>
        {DEFAULT_CATEGORIES.map(cat => {
          const count = cat === 'All' ? habits.length : habits.filter(h => h.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? 'on' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Habits Grid */}
      {sortedHabits.length === 0 ? (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--sub)'
        }}>
          <Sparkles size={36} color="var(--accent)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>No habits found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Try resetting your search query or create a new habit.
          </p>
          <button
            type="button"
            className="btn-p"
            style={{ margin: '1rem auto 0' }}
            onClick={() => {
              setEditingHabit(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} /> Create Habit Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.15rem' }}>
          {sortedHabits.map((habit) => {
            const habitId = habit._id || habit.id;
            const isDone = isDoneToday(habit);
            const isSkip = isSkippedToday(habit);
            const isMiss = isMissedToday(habit);
            const totalCompletions = (habit.completedDates || []).length;
            const targetDays = habit.target || 30;
            const progressPct = Math.min(100, Math.round((totalCompletions / targetDays) * 100));

            return (
              <div
                key={habitId}
                style={{
                  background: 'var(--card)',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  borderTop: `4px solid ${habit.color || 'var(--accent)'}`,
                  opacity: habit.status === 'paused' ? 0.75 : 1
                }}
              >
                {/* Header: Icon, Title, Category */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      fontSize: '1.5rem',
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${habit.color || '#10b981'}20`,
                      display: 'grid',
                      placeItems: 'center'
                    }}>
                      {habit.icon || '⭐'}
                    </span>
                    <div>
                      <h4
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          color: 'var(--text)'
                        }}
                        onClick={() => setDetailHabit(habit)}
                        title="Click to view full habit details"
                      >
                        {habit.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                        <span className="chip" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>{habit.category}</span>
                        <span className={`priority-tag ${habit.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {habit.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Streak pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.78rem'
                  }}>
                    <Flame size={14} /> {habit.streak || 0}d
                  </div>
                </div>

                {habit.description && (
                  <p className="habit-desc" style={{ fontSize: '0.8rem', color: 'var(--sub)' }}>
                    {habit.description}
                  </p>
                )}

                {/* Progress bar to target */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--sub)', marginBottom: '3px' }}>
                    <span>Target Progress</span>
                    <span><strong>{totalCompletions}</strong> / {targetDays} Days ({progressPct}%)</span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{ width: `${progressPct}%`, background: habit.color || 'var(--accent)' }} />
                  </div>
                </div>

                {/* 4-State Checkin Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <div className="checkin-btn-group">
                    <button
                      type="button"
                      className={`chk-btn ${isDone ? 'active completed' : ''}`}
                      onClick={() => checkinHabit(habitId)}
                    >
                      ✓ Done
                    </button>
                    <button
                      type="button"
                      className={`chk-btn ${isSkip ? 'active skipped' : ''}`}
                      onClick={() => skipHabit(habitId)}
                    >
                      ⏸ Skip
                    </button>
                    <button
                      type="button"
                      className={`chk-btn ${isMiss ? 'active missed' : ''}`}
                      onClick={() => missHabit(habitId)}
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

                  <button
                    type="button"
                    className="btn-s"
                    style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                    onClick={() => setDetailHabit(habit)}
                    title="View details & mini-heatmap"
                  >
                    <Eye size={13} /> View
                  </button>
                </div>

                {/* Card Action Toolbar */}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '4px 7px', fontSize: '0.72rem' }}
                      onClick={() => duplicateHabit(habitId)}
                      title="Duplicate habit"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '4px 7px', fontSize: '0.72rem' }}
                      onClick={() => pauseToggleHabit(habitId)}
                      title={habit.status === 'paused' ? 'Resume habit' : 'Pause habit'}
                    >
                      {habit.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
                    </button>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '4px 7px', fontSize: '0.72rem' }}
                      onClick={() => archiveHabit(habitId)}
                      title={habit.isArchived ? 'Unarchive' : 'Archive'}
                    >
                      <Archive size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                      onClick={() => {
                        setEditingHabit(habit);
                        setIsCreateModalOpen(true);
                      }}
                      title="Edit Habit"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '4px 7px', fontSize: '0.72rem', color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => {
                        if (window.confirm(`Delete habit "${habit.title}"?`)) {
                          deleteHabit(habitId);
                        }
                      }}
                      title="Delete Habit"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shared Modals */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      {detailHabit && (
        <HabitDetailModal
          habit={detailHabit}
          isOpen={!!detailHabit}
          onClose={() => setDetailHabit(null)}
          onCheckin={checkinHabit}
          onSkip={skipHabit}
          onMiss={missHabit}
          onPending={pendingHabit}
          onEdit={(h) => {
            setDetailHabit(null);
            setEditingHabit(h);
            setIsCreateModalOpen(true);
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
