import React, { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['M','T','W','T','F','S','S'];

function History({ habits = [] }) {
  const TODAY = new Date();
  const [histOff, setHistOff] = useState(0);

  const histNav = (dir) => {
    setHistOff((prev) => {
      const next = prev + dir;
      return next > 0 ? 0 : next;
    });
  };

  // Build calendar for the given month offset
  const buildCalendar = (off) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + off, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const firstDow = (new Date(yr, mo, 1).getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const todayDay = off === 0 ? TODAY.getDate() : -1;

    // Build a map of date -> completion count from habit data
    const completionMap = {};
    habits.forEach((h) => {
      (h.completedDates || []).forEach((dateStr) => {
        const dt = new Date(dateStr);
        if (dt.getFullYear() === yr && dt.getMonth() === mo) {
          const day = dt.getDate();
          completionMap[day] = (completionMap[day] || 0) + 1;
        }
      });
    });

    const totalHabits = habits.length || 1;

    const cells = [];
    // blank leading cells
    for (let i = 0; i < firstDow; i++) {
      cells.push(<div key={`blank-${i}`} className="cd blank" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === todayDay;
      const isPast = off < 0 || (off === 0 && day <= todayDay);
      const count = completionMap[day] || 0;
      let cls = '';
      if (isPast && !isToday) {
        const ratio = count / totalHabits;
        if (count === 0) cls = 'missed';
        else if (ratio >= 0.75) cls = 'l3';
        else if (ratio >= 0.5) cls = 'l2';
        else cls = 'l1';
      }
      cells.push(
        <div key={day} className={`cd ${cls} ${isToday ? 'today' : ''}`} title={`${MONTHS[mo]} ${day}, ${yr}`}>
          {day}
        </div>
      );
    }
    return { yr, mo, cells };
  };

  const { yr, mo, cells } = buildCalendar(histOff);

  // Build recent activity feed from habit completedDates
  const activities = [];
  habits.forEach((h) => {
    (h.completedDates || []).forEach((dateStr) => {
      activities.push({ title: h.title, icon: h.icon || '✅', date: new Date(dateStr) });
    });
  });
  activities.sort((a, b) => b.date - a.date);
  const recentActs = activities.slice(0, 10);

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="page on">
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title">History</div>
          <div className="pg-sub" id="histSub">{MONTHS[mo]} {yr}</div>
        </div>
        <div className="tb-right">
          <button className="ib" onClick={() => histNav(-1)}>◀</button>
          <button className="ib" onClick={() => histNav(1)}>▶</button>
        </div>
      </div>

      <div className="g2">
        {/* Calendar Card */}
        <div className="card">
          <div className="ct">📆 Calendar View</div>
          <div className="cal-hdr">
            {DAY_LABELS.map((l, i) => <div key={i} className="cal-hd">{l}</div>)}
          </div>
          <div className="cal-grid">
            {cells}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginTop: '0.7rem', fontSize: '0.69rem', color: 'var(--sub)', flexWrap: 'wrap' }}>
            <span>Less</span>
            <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: 'var(--border)' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: '#bbf7d0' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: '#4ade80' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: '#16a34a' }} />
            <span>More</span>
            <div style={{ width: '11px', height: '11px', borderRadius: '3px', background: '#fecaca', marginLeft: '0.4rem' }} />
            <span>Missed</span>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card">
          <div className="ct">📋 Recent Activity</div>
          {recentActs.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--sub)', padding: '1rem 0' }}>
              No activity yet. Start checking in your habits! 🌱
            </p>
          ) : (
            recentActs.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.52rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.81rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Completed: {a.title}
                  </div>
                  <div style={{ fontSize: '0.69rem', color: 'var(--sub)' }}>{timeAgo(a.date)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
