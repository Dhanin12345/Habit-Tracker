import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Challenges({ addXP }) {
  const { fetchWithAuth, showToast } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetchWithAuth('/api/challenges');
        if (res.ok) {
          const data = await res.json();
          setChallenges(data);
        }
      } catch (err) {
        console.error('Error loading challenges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleJoin = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/challenges/join/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const updatedChal = await res.json();
        setChallenges((prev) => prev.map((c) => c.id === id ? updatedChal : c));
        
        if (updatedChal.joined) {
          showToast(`Joined "${updatedChal.name}"! Let's go 💪`, 'success');
          addXP(25);
        } else {
          showToast(`Left "${updatedChal.name}"`, 'warning');
        }
      } else {
        showToast('Failed to update challenge status', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeChallenges = challenges.filter((c) => c.joined);

  return (
    <div className="page on">
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Challenges</div>
          <div className="pg-sub">Push your limits with timed goals</div>
        </div>
      </div>

      <div className="ct">🌟 Available Challenges</div>
      <div className="g3" style={{ marginBottom: '1.5rem' }}>
        {challenges.map((c) => {
          const progPct = Math.round((c.prog / c.days) * 100);
          return (
            <div className="cch" key={c.id}>
              <div className="cch-h">
                <div className="cch-ic" style={{ background: c.bg }}>{c.icon}</div>
                <div>
                  <div className="cch-nm">{c.name}</div>
                  <div className="cch-st">{c.days} days · {c.cat}</div>
                </div>
              </div>
              {c.joined ? (
                <>
                  <div className="pb" style={{ margin: '0.45rem 0' }}>
                    <div className="pf" style={{ background: c.color, width: `${progPct}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--sub)' }}>
                    <span>Day {c.prog}</span>
                    <span>{progPct}%</span>
                  </div>
                </>
              ) : (
                <div style={{ height: '5px', margin: '0.45rem 0' }} />
              )}
              <button
                className={`jb ${c.joined ? 'joined' : 'join'}`}
                onClick={() => handleJoin(c.id)}
              >
                {c.joined ? '✓ Joined' : 'Join →'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="ct">⚡ My Active Challenges</div>
      <div id="chalMine">
        {activeChallenges.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--sub)', fontSize: '0.85rem' }}>
            No active challenges. Join one above! 🎯
          </p>
        ) : (
          activeChallenges.map((c) => {
            const progPct = Math.round((c.prog / c.days) * 100);
            return (
              <div key={c.id} className="cch" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.8rem 0.95rem', marginBottom: '0.5rem' }}>
                <div className="cch-ic" style={{ background: c.bg, width: '40px', height: '40px' }}>{c.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cch-nm" style={{ fontSize: '0.85rem' }}>{c.name}</div>
                  <div className="pb" style={{ margin: '0.35rem 0', height: '5px' }}>
                    <div className="pf" style={{ background: c.color, width: `${progPct}%` }} />
                  </div>
                  <div style={{ fontSize: '0.69rem', color: 'var(--sub)' }}>
                    Day {c.prog} of {c.days} · {c.days - c.prog} days left
                  </div>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: c.color }}>{progPct}%</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Challenges;
