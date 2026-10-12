import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, Plus, CheckCircle, Clock, Trash2, Edit3, X, Sparkles, Award } from 'lucide-react';

export default function Goals({ habits = [] }) {
  const { fetchWithAuth, showToast } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('in_progress'); // 'in_progress' or 'achieved'

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState(30);
  const [deadline, setDeadline] = useState('');
  const [selectedHabitIds, setSelectedHabitIds] = useState([]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setTarget(30);
    setDeadline('');
    setSelectedHabitIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTarget(goal.target || 30);
    setDeadline(goal.deadline || '');
    setSelectedHabitIds(goal.relatedHabits || []);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      target: parseInt(target) || 30,
      deadline,
      relatedHabits: selectedHabitIds
    };

    try {
      if (editingGoal) {
        const res = await fetchWithAuth(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          body: payload
        });
        if (res.ok) {
          const updated = await res.json();
          setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
          showToast('Goal updated successfully!');
        }
      } else {
        const res = await fetchWithAuth('/api/goals', {
          method: 'POST',
          body: payload
        });
        if (res.ok) {
          const created = await res.json();
          setGoals(prev => [created, ...prev]);
          showToast('Goal created successfully! 🎯');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal permanently?')) return;
    try {
      const res = await fetchWithAuth(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== id));
        showToast('Goal deleted.', 'warning');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleAchieved = async (goal) => {
    const nextStatus = goal.status === 'achieved' ? 'in_progress' : 'achieved';
    try {
      const res = await fetchWithAuth(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        body: { status: nextStatus, progress: nextStatus === 'achieved' ? goal.target : goal.progress }
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
        showToast(nextStatus === 'achieved' ? '🏆 Goal marked as Achieved!' : 'Goal status set to in progress.');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleHabitLink = (habitId) => {
    const sId = String(habitId);
    if (selectedHabitIds.includes(sId)) {
      setSelectedHabitIds(selectedHabitIds.filter(id => id !== sId));
    } else {
      setSelectedHabitIds([...selectedHabitIds, sId]);
    }
  };

  const displayedGoals = goals.filter(g => activeTab === 'all' || g.status === activeTab);

  return (
    <div className="page on">
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Goal Management</div>
          <div className="pg-sub">Tie daily habits to high-impact milestones and track automatic completion</div>
        </div>

        <button type="button" className="btn-p" onClick={openCreateModal}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Tabs */}
      <div className="subtab-bar">
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('in_progress')}
        >
          🎯 In Progress ({goals.filter(g => g.status === 'in_progress').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'achieved' ? 'active' : ''}`}
          onClick={() => setActiveTab('achieved')}
        >
          🏆 Achieved ({goals.filter(g => g.status === 'achieved').length})
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Goals ({goals.length})
        </button>
      </div>

      {/* Goals Grid */}
      {displayedGoals.length === 0 ? (
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: 'var(--sub)'
        }}>
          <Target size={36} color="var(--accent)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
            {activeTab === 'achieved' ? 'No achieved goals yet' : 'No active goals'}
          </h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Set a 30-day or 60-day target milestone to supercharge your habit consistency.
          </p>
          <button type="button" className="btn-p" style={{ margin: '1rem auto 0' }} onClick={openCreateModal}>
            <Plus size={16} /> Create Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {displayedGoals.map((goal) => {
            const pct = Math.min(100, Math.round(((goal.progress || 0) / (goal.target || 1)) * 100));
            const isAchieved = goal.status === 'achieved';

            return (
              <div key={goal.id} className="goal-card" style={{ borderTop: `4px solid ${isAchieved ? '#10b981' : '#3b82f6'}` }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{isAchieved ? '🏆' : '🎯'}</span>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                        {goal.title}
                      </h3>
                      {goal.deadline && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> Deadline: {goal.deadline}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="chip" style={{
                    fontSize: '0.7rem',
                    background: isAchieved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: isAchieved ? '#10b981' : '#3b82f6',
                    fontWeight: 800
                  }}>
                    {isAchieved ? 'Achieved' : 'In Progress'}
                  </span>
                </div>

                {goal.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--sub)', lineHeight: 1.5 }}>
                    {goal.description}
                  </p>
                )}

                {/* Linked habits */}
                {goal.relatedHabits && goal.relatedHabits.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Linked Habits:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {goal.relatedHabits.map(hId => {
                        const h = habits.find(x => String(x._id || x.id) === String(hId));
                        if (!h) return null;
                        return (
                          <span key={hId} className="chip" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {h.icon} {h.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--sub)' }}>Milestone Progress</span>
                    <span style={{ color: 'var(--text)' }}>
                      <strong>{goal.progress}</strong> / {goal.target} Days ({pct}%)
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{ width: `${pct}%`, background: isAchieved ? '#10b981' : undefined }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.75rem',
                  marginTop: 'auto'
                }}>
                  <button
                    type="button"
                    className="btn-s"
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    onClick={() => handleToggleAchieved(goal)}
                  >
                    <CheckCircle size={14} color={isAchieved ? '#10b981' : 'var(--sub)'} />
                    {isAchieved ? 'Reopen Goal' : 'Mark Achieved'}
                  </button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                      onClick={() => openEditModal(goal)}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Target size={20} color="var(--accent)" />
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal}>
              <div className="modal-body">
                <div className="field">
                  <label>Goal Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days of Relentless Coding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label>Description / Outcome Vision</label>
                  <input
                    type="text"
                    placeholder="e.g. Build and launch 2 full-stack SaaS projects"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="field">
                    <label>Target Days *</label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Target Deadline (Optional)</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Related Habits (Auto-advance goal on check-in)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {habits.map(h => {
                      const hId = String(h._id || h.id);
                      const isLinked = selectedHabitIds.includes(hId);
                      return (
                        <button
                          key={hId}
                          type="button"
                          onClick={() => toggleHabitLink(hId)}
                          style={{
                            background: isLinked ? 'var(--accent-l)' : 'var(--surface)',
                            color: isLinked ? 'var(--accent)' : 'var(--sub)',
                            border: isLinked ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {h.icon} {h.title} {isLinked ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-s" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-p">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
