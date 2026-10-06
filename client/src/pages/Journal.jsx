import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MOODS = ['😄', '🙂', '😐', '😔', '😤'];

function Journal({ addXP }) {
  const { fetchWithAuth, showToast } = useAuth();
  const [mood, setMood] = useState(0);
  const [text, setText] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const res = await fetchWithAuth('/api/journal');
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error('Error loading journal:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) {
      showToast('Write something first!', 'warning');
      return;
    }
    try {
      const res = await fetchWithAuth('/api/journal', {
        method: 'POST',
        body: {
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          mood: MOODS[mood],
          text: text.trim()
        }
      });
      if (res.ok) {
        const newEntry = await res.json();
        setEntries((prev) => [newEntry, ...prev]);
        setText('');
        addXP(20);
        showToast('Journal saved! +20 XP ✍️', 'success');
      } else {
        showToast('Failed to save journal entry', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page on">
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Journal</div>
          <div className="pg-sub">Reflect on your daily progress</div>
        </div>
      </div>

      <div className="g2">
        {/* Write Entry Card */}
        <div className="card">
          <div className="ct">✍️ Today's Entry</div>
          <div style={{ fontSize: '0.71rem', fontWeight: 800, color: 'var(--sub)', marginBottom: '0.3rem' }}>
            HOW ARE YOU FEELING?
          </div>
          <div className="mood-row">
            {MOODS.map((m, i) => (
              <button
                key={i}
                className={`mb ${mood === i ? 'on' : ''}`}
                onClick={() => setMood(i)}
              >
                {m}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.71rem', fontWeight: 800, color: 'var(--sub)', margin: '0.55rem 0 0.32rem' }}>
            NOTES
          </div>
          <textarea
            id="jTxt"
            placeholder="How did your habits go today? Any wins or challenges?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mrow" style={{ marginTop: '0.6rem' }}>
            <button className="btn sm" onClick={handleSave}>Save Entry</button>
            <button className="btn sm ghost" onClick={() => setText('')}>Clear</button>
          </div>
        </div>

        {/* Past Entries Card */}
        <div className="card">
          <div className="ct">📖 Past Entries</div>
          {loading ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)', padding: '1rem 0' }}>
              Loading journal entries... ⏳
            </p>
          ) : entries.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)', padding: '1rem 0' }}>
              No entries yet. Write your first one! 📝
            </p>
          ) : (
            entries.map((e, i) => (
              <div key={i} className="je">
                <div className="je-d">
                  {e.date} <span style={{ fontSize: '0.85rem' }}>{e.mood}</span>
                </div>
                <div className="je-t">{e.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Journal;
