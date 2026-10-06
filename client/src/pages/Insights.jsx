import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Insights({ habits = [], checkinHabit, addHabit, setActiveTab }) {
  const { fetchWithAuth, showToast } = useAuth();
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Coach state
  const [coachPrompt, setCoachPrompt] = useState('');
  const [coachResponse, setCoachResponse] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/insights');
      if (res.ok) {
        const data = await res.json();
        setInsightsData(data);
      }
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [habits]);

  const handleAskCoach = async (queryText) => {
    const textToSend = queryText || coachPrompt;
    setCoachLoading(true);
    try {
      const res = await fetchWithAuth('/api/ai-coach', {
        method: 'POST',
        body: { prompt: textToSend }
      });
      if (res.ok) {
        const data = await res.json();
        setCoachResponse(data);
      } else {
        showToast('Failed to contact AI Coach', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCoachLoading(false);
    }
  };

  const handleAddSuggestedHabit = async (rec) => {
    const success = await addHabit(rec.title, rec.category, rec.icon, 'Daily', 30);
    if (success) {
      showToast(`Added recommended habit: ${rec.title}!`, 'success');
      fetchInsights();
    }
  };

  if (loading && !insightsData) {
    return (
      <div className="page on" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🧠</div>
        <p style={{ marginTop: '0.8rem', color: 'var(--sub)', fontWeight: 600 }}>Analyzing habit patterns & generating smart insights...</p>
      </div>
    );
  }

  const {
    todayDoneCount = 0,
    dailyTarget = 4,
    dailyTargetPct = 0,
    predictiveStreakBreaks = [],
    focusHabit = null,
    categoryPerformance = [],
    smartRecommendations = [],
    moodAnalysis = [],
    timezone = 'UTC'
  } = insightsData || {};

  return (
    <div className="page on">
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Smart Insights & AI Coach</div>
          <div className="pg-sub">Server-computed predictive analytics and personalized habit optimization</div>
        </div>
        <div className="tb-right">
          <span style={{ fontSize: '0.74rem', background: 'var(--accent-l)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '8px', fontWeight: 700 }}>
            🌐 {timezone}
          </span>
          <button className="btn sm outline" onClick={fetchInsights} title="Refresh Analysis">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Target Progress & Predictive Alert Row */}
      <div className="g2" style={{ marginBottom: '1.25rem' }}>
        {/* Daily Target Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="ct">🎯 Daily Completion Target</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.4rem 0' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent)' }}>{todayDoneCount}</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--sub)', fontWeight: 700 }}>/ {dailyTarget} habits target</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--sub)', marginBottom: '0.75rem' }}>
              {todayDoneCount >= dailyTarget 
                ? '🎉 Congratulations! You have achieved your daily habit target!' 
                : `${dailyTarget - todayDoneCount} more completion(s) needed today to hit your personal target.`}
            </div>
          </div>
          <div>
            <div className="pb" style={{ height: '10px' }}>
              <div
                className="pf"
                style={{
                  width: `${dailyTargetPct}%`,
                  background: dailyTargetPct >= 100 ? '#16a34a' : 'var(--accent)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: 'var(--sub)', marginTop: '0.35rem' }}>
              <span>DAILY TARGET STATUS</span>
              <span>{dailyTargetPct}% COMPLETED</span>
            </div>
          </div>
        </div>

        {/* Predictive Streak-Break Detection */}
        <div className="card">
          <div className="ct">⚡ Predictive Streak-Break Alert</div>
          {predictiveStreakBreaks.length === 0 ? (
            <div style={{ padding: '1rem 0', color: 'var(--sub)', fontSize: '0.84rem' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>🛡️</span>
              All active streaks are safe for today! None are at imminent risk of breaking.
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.55rem' }}>
                ⚠️ {predictiveStreakBreaks.length} habit{predictiveStreakBreaks.length > 1 ? 's' : ''} at risk of breaking:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {predictiveStreakBreaks.slice(0, 3).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.83rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>
                        🔥 {item.streak}-day streak · {item.hoursLeft}h remaining today
                      </div>
                    </div>
                    <button
                      className="btn sm"
                      style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                      onClick={() => checkinHabit(item.id)}
                    >
                      Save Streak ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focus Habit Recommendation Card */}
      {focusHabit && (
        <div className="focus-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '2rem' }}>{focusHabit.icon || '⭐'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{focusHabit.title}</span>
                <span className={`priority-tag ${focusHabit.priority?.toLowerCase() || 'medium'}`}>
                  {focusHabit.priority} Priority
                </span>
                <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 800 }}>
                  🔥 {focusHabit.streak} days
                </span>
              </div>
              <p style={{ fontSize: '0.81rem', color: 'var(--sub)', marginTop: '0.2rem' }}>
                💡 <strong>Why this habit?</strong> {focusHabit.reason}
              </p>
            </div>
            <button className="btn sm" onClick={() => checkinHabit(focusHabit.id)}>
              Complete Now ✓
            </button>
          </div>
        </div>
      )}

      {/* AI Habit Coach Section */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="ct" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🤖 AI Habit Coach</span>
          <span style={{ fontSize: '0.7rem', background: 'var(--accent-l)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '6px' }}>
            Powered by Contextual Analytics
          </span>
        </div>

        {/* Quick Prompts */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', margin: '0.65rem 0' }}>
          {[
            'How do I maintain consistency without burnout?',
            'Recommend a habit stacking routine for today.',
            'How do I overcome evening procrastination?',
            'Analyze my habit streak performance.'
          ].map((promptText, idx) => (
            <button
              key={idx}
              className="chip"
              style={{ fontSize: '0.74rem', padding: '5px 11px' }}
              onClick={() => {
                setCoachPrompt(promptText);
                handleAskCoach(promptText);
              }}
            >
              💬 {promptText}
            </button>
          ))}
        </div>

        {/* Prompt Input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            placeholder="Ask AI Coach for habit advice, routines, or motivation..."
            value={coachPrompt}
            onChange={(e) => setCoachPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskCoach()}
            style={{
              flex: 1,
              border: '1.5px solid var(--border)',
              borderRadius: '9px',
              padding: '9px 12px',
              fontSize: '0.85rem',
              background: 'var(--card)',
              color: 'var(--text)'
            }}
          />
          <button
            className="btn sm"
            onClick={() => handleAskCoach()}
            disabled={coachLoading}
            style={{ minWidth: '95px' }}
          >
            {coachLoading ? 'Analyzing...' : 'Ask Coach 🚀'}
          </button>
        </div>

        {/* Coach Output */}
        {coachResponse && (
          <div className="coach-chat-bubble coach">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>🧠 {coachResponse.coach}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{coachResponse.userQuery}</span>
            </div>
            <p style={{ marginBottom: '0.75rem', color: 'var(--text)' }}>{coachResponse.advice}</p>

            {coachResponse.actionPlan && coachResponse.actionPlan.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--sub)', letterSpacing: '0.04em' }}>
                  Recommended Action Steps:
                </div>
                {coachResponse.actionPlan.map((step, idx) => (
                  <div key={idx} className="coach-plan-step">
                    <span className="step-num">{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: Category Performance + Smart Habit Recommendations */}
      <div className="g2" style={{ marginBottom: '1.25rem' }}>
        {/* Category Performance */}
        <div className="card">
          <div className="ct">📊 Category Performance Analysis</div>
          {categoryPerformance.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)', padding: '1rem 0' }}>
              Create habits across categories to see performance breakdowns.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              {categoryPerformance.map((item) => (
                <div key={item.category} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <span>{item.category} ({item.habitCount} habit{item.habitCount > 1 ? 's' : ''})</span>
                    <span style={{ color: 'var(--accent)' }}>{item.totalCompletions} total check-ins</span>
                  </div>
                  <div className="pb" style={{ height: '6px' }}>
                    <div className="pf" style={{ width: `${item.completionRateToday}%`, background: 'var(--accent)' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--sub)', marginTop: '2px', textAlign: 'right' }}>
                    {item.completionRateToday}% done today
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Recommendations */}
        <div className="card">
          <div className="ct">💡 Intelligent Habit Recommendations</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--sub)', marginBottom: '0.65rem' }}>
            Recommended based on your current routine to balance wellness:
          </div>
          {smartRecommendations.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>All foundational habit categories are well-represented!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {smartRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{rec.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.83rem', fontWeight: 800 }}>{rec.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{rec.reason}</div>
                  </div>
                  <button
                    className="btn sm ghost"
                    style={{ fontSize: '0.74rem', padding: '5px 9px' }}
                    onClick={() => handleAddSuggestedHabit(rec)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mood vs Habit Correlation Card */}
      {moodAnalysis.length > 0 && (
        <div className="card">
          <div className="ct">📈 Mood vs Habit-Performance Correlation</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--sub)', marginBottom: '0.65rem' }}>
            Observed relationship between daily mood and completions from your journal:
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
            {moodAnalysis.map((item, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '110px',
                  padding: '0.7rem',
                  borderRadius: '10px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>{item.mood}</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, margin: '0.2rem 0' }}>{item.date}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800 }}>
                  {item.habitsDone} completed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Insights;
