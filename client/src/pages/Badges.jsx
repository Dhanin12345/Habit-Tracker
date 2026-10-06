import React from 'react';
import { useAuth } from '../context/AuthContext';

const ALL_BADGES = [
  { id: 'starter', n: 'Starter Badge', d: 'Check in a habit for the first time', e: '🚀', xp: 50 },
  { id: 'bronze', n: 'Bronze Badge', d: 'Achieve a 7-day streak on any habit', e: '🥉', xp: 100 },
  { id: 'silver', n: 'Silver Badge', d: 'Achieve a 15-day streak on any habit', e: '🥈', xp: 150 },
  { id: 'gold', n: 'Gold Badge', d: 'Achieve a 30-day streak on any habit', e: '🥇', xp: 200 },
  { id: 'consistency', n: 'Consistency Master', d: 'Complete habits a total of 50 times', e: '👑', xp: 250 },
  { id: 'diverse', n: 'Diverse Habits', d: 'Complete habits in 3 or more categories', e: '🌈', xp: 80 },
  { id: 'perfect', n: 'Perfect Day', d: 'Complete ALL habits in a single day', e: '⭐', xp: 150 },
  { id: 'legend', n: 'Legend', d: '21-day streak achieved on any habit', e: '🏆', xp: 200 },
];

function Badges({ habits = [], xp = 0, level = 1 }) {
  const { user } = useAuth();
  const userBadges = user?.badges || [];

  const earned = ALL_BADGES.filter((b) => userBadges.includes(b.n));
  const totalXpFromBadges = earned.reduce((a, b) => a + b.xp, 0);
  const completionPct = Math.round((earned.length / ALL_BADGES.length) * 100);

  return (
    <div className="page on">
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">Badges</div>
          <div className="pg-sub">Your achievements & milestones</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="g4" style={{ marginBottom: '1.2rem' }}>
        <div className="sc">
          <div className="sc-v" style={{ color: 'var(--yellow)' }}>{earned.length}</div>
          <div className="sc-l">Badges Earned</div>
        </div>
        <div className="sc">
          <div className="sc-v">{ALL_BADGES.length}</div>
          <div className="sc-l">Total Available</div>
        </div>
        <div className="sc">
          <div className="sc-v" style={{ color: 'var(--accent)' }}>{completionPct}%</div>
          <div className="sc-l">Completion</div>
        </div>
        <div className="sc">
          <div className="sc-v" style={{ color: '#8b5cf6' }}>{totalXpFromBadges}</div>
          <div className="sc-l">XP from Badges</div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="bg-grid">
        {ALL_BADGES.map((b) => {
          const isEarned = userBadges.includes(b.n);
          return (
            <div key={b.id} className={`bc ${isEarned ? 'earned' : 'locked'}`}>
              <em>{b.e}</em>
              <strong>{b.n}</strong>
              <span>{b.d}</span>
              <small>{isEarned ? `✓ +${b.xp} XP` : '🔒 Locked'}</small>
            </div>
          );
        })}
      </div>

      {/* Motivational tip */}
      {earned.length < ALL_BADGES.length && (
        <div className="card" style={{ marginTop: '1.25rem', textAlign: 'center', color: 'var(--sub)', fontSize: '0.83rem' }}>
          🌟 Keep completing your habits daily to unlock more badges and earn XP!
        </div>
      )}
    </div>
  );
}

export default Badges;
