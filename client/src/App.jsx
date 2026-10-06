import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import Challenges from './pages/Challenges';
import Badges from './pages/Badges';
import History from './pages/History';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user, loading, fetchWithAuth, showToast, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login');
  const [authEmail, setAuthEmail] = useState('');

  // Habits state loaded from Django API
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // XP, Leveling and Dark mode states
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('zh_xp') || '240'));
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem('zh_level') || '3'));
  const [xpMax, setXpMax] = useState(() => parseInt(localStorage.getItem('zh_xpMax') || '400'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('zh_darkMode') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('zh_darkMode', darkMode.toString());
  }, [darkMode]);

  // Fetch habits from database when user is authenticated
  const fetchHabits = async () => {
    if (!user) return;
    setLoadingHabits(true);
    try {
      const res = await fetchWithAuth('/api/habits?include_archived=true');
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoadingHabits(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]);

  // Experience level engine
  const addXP = (pts) => {
    setXp((prevXp) => {
      let newXp = prevXp + pts;
      let newLevel = level;
      let newXpMax = xpMax;
      while (newXp >= newXpMax) {
        newXp -= newXpMax;
        newLevel += 1;
        newXpMax = Math.round(newXpMax * 1.4);
        setTimeout(() => {
          showToast(`🎉 Level Up! You are now Level ${newLevel}!`, 'success');
        }, 100);
      }
      localStorage.setItem('zh_xp', newXp.toString());
      localStorage.setItem('zh_level', newLevel.toString());
      localStorage.setItem('zh_xpMax', newXpMax.toString());
      setLevel(newLevel);
      setXpMax(newXpMax);
      return newXp;
    });
  };

  // Check in a habit
  const checkinHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/checkin/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setHabits((prev) => prev.map((h) => (h._id === id ? data.habit : h)));
        addXP(15);
        showToast(`${data.habit.title} checked in! +15 XP`, 'success');

        if (data.newBadges && data.newBadges.length > 0) {
          data.newBadges.forEach((b) => {
            showToast(`🏅 Unlocked Badge: ${b}! +80 XP`, 'success');
            addXP(80);
          });
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Checkin failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Skip a habit
  const skipHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/skip/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => (h._id === id ? updated : h)));
        showToast('Habit skipped for today', 'warning');
      } else {
        const err = await res.json();
        showToast(err.message || 'Skip failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create a new habit (accepts either payload object or separate parameters)
  const addHabit = async (titleOrPayload, category, icon, frequency, targetDays) => {
    let payload = {};
    if (typeof titleOrPayload === 'object' && titleOrPayload !== null) {
      payload = titleOrPayload;
    } else {
      payload = {
        title: titleOrPayload,
        category: category || 'Health',
        icon: icon || '⭐',
        frequency: frequency || 'Daily',
        target: parseInt(targetDays) || 30
      };
    }

    try {
      const res = await fetchWithAuth('/api/habits', {
        method: 'POST',
        body: payload
      });
      if (res.ok) {
        const newHabit = await res.json();
        setHabits((prev) => [...prev, newHabit]);
        addXP(25);
        showToast(`Habit "${payload.title}" created successfully! +25 XP`, 'success');
        return true;
      } else {
        const err = await res.json();
        showToast(err.message || 'Creation failed', 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Edit an existing habit
  const editHabit = async (id, payload) => {
    try {
      const res = await fetchWithAuth(`/api/habits/${id}`, {
        method: 'PUT',
        body: payload
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits((prev) => prev.map((h) => (h._id === id ? updatedHabit : h)));
        showToast(`Habit "${updatedHabit.title}" updated!`, 'success');
        return true;
      } else {
        const err = await res.json();
        showToast(err.message || 'Update failed', 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Archive / unarchive a habit
  const archiveHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/archive/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits((prev) => prev.map((h) => (h._id === id ? updatedHabit : h)));
        showToast(
          updatedHabit.isArchived
            ? `Archived "${updatedHabit.title}" 📦`
            : `Unarchived "${updatedHabit.title}" 📂`,
          'info'
        );
        return true;
      } else {
        showToast('Archive operation failed', 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Delete a habit
  const deleteHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHabits((prev) => prev.filter((h) => h._id !== id));
        showToast('Habit deleted successfully', 'warning');
        return true;
      } else {
        showToast('Failed to delete habit', 'error');
        return false;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  // Reset progress locally
  const resetProgress = () => {
    setXp(0);
    setLevel(1);
    setXpMax(100);
    localStorage.setItem('zh_xp', '0');
    localStorage.setItem('zh_level', '1');
    localStorage.setItem('zh_xpMax', '100');
    showToast('Level progress reset.', 'warning');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem',
        background: 'var(--bg)',
        color: 'var(--text)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(5, 150, 105, 0.1)',
          borderTopColor: '#059669',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Loading ZenHabit...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in: auth cards
  if (!user) {
    return authPage === 'login' 
      ? <Login initialEmail={authEmail} onNavigateToRegister={(em) => { if (em) setAuthEmail(em); setAuthPage('register'); }} />
      : <Register initialEmail={authEmail} onNavigateToLogin={(em) => { if (em) setAuthEmail(em); setAuthPage('login'); }} />;
  }

  // Today's date checkin variables
  const todayISO = new Date().toISOString().slice(0, 10);
  const isDoneToday = (h) => {
    return h.completedDates && h.completedDates.some(d => d.slice(0, 10) === todayISO);
  };
  const activeHabits = habits.filter(h => !h.isArchived);
  const uncompletedCount = activeHabits.filter(h => !isDoneToday(h)).length;

  return (
    <div className="shell">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        xp={xp}
        level={level}
        xpMax={xpMax}
        uncompletedCount={uncompletedCount}
      />

      <main className="main">
        {activeTab === 'dashboard' && (
          <Dashboard 
            habits={habits} 
            checkinHabit={checkinHabit}
            xp={xp}
            level={level}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        )}

        {activeTab === 'habits' && (
          <Habits 
            habits={habits} 
            checkinHabit={checkinHabit}
            skipHabit={skipHabit}
            addHabit={addHabit}
            editHabit={editHabit}
            archiveHabit={archiveHabit}
            deleteHabit={deleteHabit} 
          />
        )}

        {activeTab === 'insights' && (
          <Insights
            habits={habits}
            checkinHabit={checkinHabit}
            addHabit={addHabit}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            habits={habits}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'challenges' && (
          <Challenges 
            addXP={addXP}
          />
        )}

        {activeTab === 'badges' && (
          <Badges 
            habits={habits}
            xp={xp}
            level={level}
          />
        )}

        {activeTab === 'history' && (
          <History 
            habits={habits} 
          />
        )}

        {activeTab === 'journal' && (
          <Journal 
            addXP={addXP}
          />
        )}

        {activeTab === 'profile' && (
          <Profile setActiveTab={setActiveTab} />
        )}

        {activeTab === 'settings' && (
          <Settings 
            habits={habits}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            resetProgress={resetProgress}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
