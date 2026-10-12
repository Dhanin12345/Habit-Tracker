import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { sound } from './utils/sound';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import CreateHabitModal from './components/CreateHabitModal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import CalendarView from './pages/CalendarView';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Badges from './pages/Badges';
import Challenges from './pages/Challenges';
import History from './pages/History';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user, loading, fetchWithAuth, showToast, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authPage, setAuthPage] = useState('landing'); // 'landing', 'login', 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('hf_splash_shown'));

  // Habits state
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Create habit modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabitData, setEditingHabitData] = useState(null);

  // Gamification & Theme states
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('zh_xp') || '240'));
  const [level, setLevel] = useState(() => parseInt(localStorage.getItem('zh_level') || '3'));
  const [xpMax, setXpMax] = useState(() => parseInt(localStorage.getItem('zh_xpMax') || '400'));
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('zh_darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('zh_darkMode', darkMode.toString());
  }, [darkMode]);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hf_splash_shown', 'true');
  };

  // Fetch habits from database
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

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetchWithAuth('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchNotifications();
    }
  }, [user]);

  // Experience level engine
  const addXP = (pts) => {
    setXp((prevXp) => {
      let newXp = prevXp + pts;
      let newLevel = level;
      let newXpMax = xpMax;
      let leveledUp = false;

      while (newXp >= newXpMax) {
        newXp -= newXpMax;
        newLevel += 1;
        newXpMax = Math.round(newXpMax * 1.4);
        leveledUp = true;
      }

      if (leveledUp) {
        sound.playLevelUpSound();
        setTimeout(() => {
          showToast(`🎉 Level Up! You reached Level ${newLevel}!`, 'success');
        }, 150);
      }

      localStorage.setItem('zh_xp', newXp.toString());
      localStorage.setItem('zh_level', newLevel.toString());
      localStorage.setItem('zh_xpMax', newXpMax.toString());
      setLevel(newLevel);
      setXpMax(newXpMax);
      return newXp;
    });
  };

  // Check in a habit (✓ Completed)
  const checkinHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/checkin/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? data.habit : h)));

        sound.playCompletionChime();
        addXP(10);
        showToast(`${data.habit.title} checked in! +10 XP ✓`, 'success');

        if (data.habit.streak === 7) {
          addXP(50);
          sound.playStreakChime();
          showToast('🔥 7-Day Streak Milestone achieved! +50 XP', 'success');
        } else if (data.habit.streak === 30) {
          addXP(200);
          sound.playStreakChime();
          showToast('🏆 30-Day Streak Master milestone! +200 XP', 'success');
        }

        if (data.newBadges && data.newBadges.length > 0) {
          data.newBadges.forEach((b) => {
            sound.playStreakChime();
            showToast(`🏅 Unlocked Achievement: ${b}! +80 XP`, 'success');
            addXP(80);
          });
        }
        fetchNotifications();
      } else {
        const err = await res.json();
        showToast(err.message || 'Checkin failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Skip a habit (⏸ Skipped)
  const skipHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/skip/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updated : h)));
        showToast(`Habit "${updated.title}" skipped for today (streak frozen).`, 'warning');
      } else {
        const err = await res.json();
        showToast(err.message || 'Skip failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Mark habit missed (✗ Missed)
  const missHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/miss/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updated : h)));
        showToast(`Habit marked missed for today.`, 'error');
      } else {
        const err = await res.json();
        showToast(err.message || 'Action failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset habit status back to pending (⏳ Pending)
  const pendingHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/pending/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updated : h)));
        showToast(`Check-in status reset to pending.`, 'info');
      } else {
        const err = await res.json();
        showToast(err.message || 'Action failed', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create habit
  const addHabit = async (payloadOrTitle, category, icon, frequency, target) => {
    let payload = {};
    if (typeof payloadOrTitle === 'object' && payloadOrTitle !== null) {
      payload = payloadOrTitle;
    } else {
      payload = {
        title: payloadOrTitle,
        category: category || 'Coding',
        icon: icon || '💻',
        frequency: frequency || 'Daily',
        target: parseInt(target) || 30
      };
    }

    try {
      const res = await fetchWithAuth('/api/habits', {
        method: 'POST',
        body: payload
      });
      if (res.ok) {
        const newHabit = await res.json();
        setHabits((prev) => [newHabit, ...prev]);
        addXP(25);
        showToast(`Habit "${newHabit.title}" created successfully! +25 XP 🚀`, 'success');
        fetchNotifications();
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

  // Edit habit
  const editHabit = async (id, payload) => {
    try {
      const res = await fetchWithAuth(`/api/habits/${id}`, {
        method: 'PUT',
        body: payload
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updatedHabit : h)));
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

  // Duplicate habit
  const duplicateHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/duplicate/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const cloned = await res.json();
        setHabits((prev) => [cloned, ...prev]);
        showToast(`Duplicated habit: "${cloned.title}" 📋`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Pause / Resume habit
  const pauseToggleHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/pause/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updated : h)));
        showToast(
          updated.status === 'paused'
            ? `Habit "${updated.title}" paused ⏸`
            : `Habit "${updated.title}" resumed ▶️`,
          'info'
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Archive / Unarchive habit
  const archiveHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/archive/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const updatedHabit = await res.json();
        setHabits((prev) => prev.map((h) => ((h._id === id || h.id === id) ? updatedHabit : h)));
        showToast(
          updatedHabit.isArchived
            ? `Archived "${updatedHabit.title}" 📦`
            : `Unarchived "${updatedHabit.title}" 📂`,
          'info'
        );
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      const res = await fetchWithAuth(`/api/habits/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHabits((prev) => prev.filter((h) => (h._id !== id && h.id !== id)));
        showToast('Habit deleted successfully', 'warning');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
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
    showToast('Level & XP progress reset.', 'warning');
  };

  // Loading state
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
          width: '44px',
          height: '44px',
          border: '4px solid rgba(16, 185, 129, 0.15)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' }}>
          Initializing HabitFlow AI...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in: Landing page or Auth cards
  if (!user) {
    if (authPage === 'landing') {
      return (
        <LandingPage
          onEnterApp={() => setAuthPage('login')}
          onOpenLogin={() => setAuthPage('login')}
          onOpenRegister={() => setAuthPage('register')}
        />
      );
    }

    if (authPage === 'register') {
      return (
        <Register
          initialEmail={authEmail}
          onNavigateToLogin={(em) => { if (em) setAuthEmail(em); setAuthPage('login'); }}
          onBackToLanding={() => setAuthPage('landing')}
        />
      );
    }

    return (
      <Login
        initialEmail={authEmail}
        onNavigateToRegister={(em) => { if (em) setAuthEmail(em); setAuthPage('register'); }}
        onBackToLanding={() => setAuthPage('landing')}
      />
    );
  }

  // Uncompleted & unread badge counters
  const todayISO = new Date().toISOString().slice(0, 10);
  const isDoneToday = (h) => h.completedDates && h.completedDates.some(d => d.slice(0, 10) === todayISO);
  const activeHabits = habits.filter(h => !h.isArchived && h.status !== 'paused');
  const uncompletedCount = activeHabits.filter(h => !isDoneToday(h)).length;
  const unreadNotifsCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="shell">
      {/* Splash Screen on initial launch */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xp={xp}
        level={level}
        xpMax={xpMax}
        uncompletedCount={uncompletedCount}
        unreadNotifsCount={unreadNotifsCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="main">
        {activeTab === 'dashboard' && (
          <Dashboard
            habits={habits}
            checkinHabit={checkinHabit}
            skipHabit={skipHabit}
            missHabit={missHabit}
            pendingHabit={pendingHabit}
            addHabit={addHabit}
            editHabit={(h) => {
              setEditingHabitData(h);
              setIsCreateModalOpen(true);
            }}
            duplicateHabit={duplicateHabit}
            pauseToggleHabit={pauseToggleHabit}
            archiveHabit={archiveHabit}
            deleteHabit={deleteHabit}
            setActiveTab={setActiveTab}
            onOpenCreateHabit={() => {
              setEditingHabitData(null);
              setIsCreateModalOpen(true);
            }}
            xp={xp}
            level={level}
          />
        )}

        {activeTab === 'habits' && (
          <Habits
            habits={habits}
            checkinHabit={checkinHabit}
            skipHabit={skipHabit}
            missHabit={missHabit}
            pendingHabit={pendingHabit}
            addHabit={addHabit}
            editHabit={editHabit}
            duplicateHabit={duplicateHabit}
            pauseToggleHabit={pauseToggleHabit}
            archiveHabit={archiveHabit}
            deleteHabit={deleteHabit}
            onOpenCreateHabit={() => {
              setEditingHabitData(null);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            habits={habits}
            checkinHabit={checkinHabit}
            skipHabit={skipHabit}
            missHabit={missHabit}
            pendingHabit={pendingHabit}
          />
        )}

        {activeTab === 'goals' && (
          <Goals habits={habits} />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            habits={habits}
            darkMode={darkMode}
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

        {activeTab === 'badges' && (
          <Badges
            habits={habits}
            xp={xp}
            level={level}
          />
        )}

        {activeTab === 'challenges' && (
          <Challenges addXP={addXP} />
        )}

        {activeTab === 'history' && (
          <History habits={habits} />
        )}

        {activeTab === 'journal' && (
          <Journal addXP={addXP} />
        )}

        {activeTab === 'notifications' && (
          <Notifications />
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

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Create / Edit Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHabitData(null);
        }}
        onSave={async (payload, id) => {
          if (id) {
            await editHabit(id, payload);
          } else {
            await addHabit(payload);
          }
        }}
        editingHabit={editingHabitData}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
