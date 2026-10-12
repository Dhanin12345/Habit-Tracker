import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Activity, CheckCircle, Database,
  TrendingUp, Award, RefreshCw, Key
} from 'lucide-react';

export default function AdminDashboard() {
  const { fetchWithAuth, showToast, user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resOverview, resUsers] = await Promise.all([
        fetchWithAuth('/api/admin/overview'),
        fetchWithAuth('/api/admin/users')
      ]);

      if (resOverview.ok) {
        const ov = await resOverview.json();
        setMetrics(ov.metrics);
        setPopularCategories(ov.popularCategories || []);
        setActivityLogs(ov.activityLogs || []);
      }

      if (resUsers.ok) {
        const uList = await resUsers.json();
        setUsersList(uList);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleStaffRole = async (targetId, currentStaff) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${targetId}/toggle-staff`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => u.id === targetId ? { ...u, isAdmin: data.isAdmin } : u));
        showToast(data.message);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page on">
      {/* Top Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="pg-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} color="#8b5cf6" />
            HabitFlow AI Admin Portal
          </div>
          <div className="pg-sub">
            System performance telemetry, user access control, and platform usage analytics
          </div>
        </div>

        <button type="button" className="btn-s" onClick={fetchAdminData}>
          <RefreshCw size={15} /> Refresh Data
        </button>
      </div>

      {/* System Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="sc">
          <div className="sc-lbl">Total Registered Users</div>
          <div className="sc-val" style={{ color: '#8b5cf6' }}>{metrics?.totalUsers || 0}</div>
          <div className="sc-sub">User accounts on SQLite database</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Active Users</div>
          <div className="sc-val" style={{ color: 'var(--accent)' }}>{metrics?.activeUsers || 1}</div>
          <div className="sc-sub">Engaging with daily habits</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Total Habits Tracked</div>
          <div className="sc-val" style={{ color: '#3b82f6' }}>{metrics?.totalHabits || 0}</div>
          <div className="sc-sub">{metrics?.activeHabits || 0} currently active</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">Total Check-Ins</div>
          <div className="sc-val" style={{ color: '#f59e0b' }}>{metrics?.totalCompletions || 0}</div>
          <div className="sc-sub">Habit completions logged</div>
        </div>

        <div className="sc">
          <div className="sc-lbl">System Uptime</div>
          <div className="sc-val" style={{ color: '#10b981' }}>{metrics?.serverUptime || '99.98%'}</div>
          <div className="sc-sub">FastAPI / Django REST API</div>
        </div>
      </div>

      {/* Two Column Layout: Categories & Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* Popular Categories */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.35rem',
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>
            Popular Habit Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {popularCategories.length === 0 ? (
              <div style={{ color: 'var(--sub)', fontSize: '0.85rem' }}>No category data available yet.</div>
            ) : (
              popularCategories.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                    {c.category}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '100px',
                      height: '6px',
                      background: 'var(--bg)',
                      borderRadius: '100px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, c.count * 15)}%`,
                        height: '100%',
                        background: 'var(--accent)'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--sub)' }}>
                      {c.count} habits
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity Feed */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.35rem',
          boxShadow: 'var(--shadow)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>
            Recent System Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activityLogs.length === 0 ? (
              <div style={{ color: 'var(--sub)', fontSize: '0.85rem' }}>No recent events recorded.</div>
            ) : (
              activityLogs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} color="var(--accent)" />
                    <span><strong>{log.user}</strong>: {log.action}</span>
                  </div>
                  <span style={{ color: 'var(--sub)', fontSize: '0.72rem' }}>{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem' }}>
          Registered User Accounts ({usersList.length})
        </h3>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Email</th>
                <th>Habits</th>
                <th>Completions</th>
                <th>Badges</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.habitsCount}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 800 }}>{u.completionsCount}</td>
                  <td>{u.badgesCount}</td>
                  <td style={{ color: 'var(--sub)' }}>{u.createdAt}</td>
                  <td>
                    <span className="chip" style={{
                      fontSize: '0.7rem',
                      background: u.isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg)',
                      color: u.isAdmin ? '#8b5cf6' : 'var(--sub)',
                      fontWeight: 800
                    }}>
                      {u.isAdmin ? '🛡️ Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-s"
                      style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      onClick={() => toggleStaffRole(u.id, u.isAdmin)}
                    >
                      {u.isAdmin ? 'Demote' : 'Promote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
