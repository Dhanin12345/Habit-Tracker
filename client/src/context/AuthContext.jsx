import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast notifier helper
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // On mount, load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}! 👋`);
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      showToast(`Account created successfully! Welcome ${data.user.name}! 🚀`);
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.');
  };

  // Helper fetch with auth
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    // Auto content-type JSON if body is object and not FormData
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Auto logout if unauthorized
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchWithAuth, showToast, toasts, setUser }}>
      {children}
      
      {/* Dynamic Toasts Overlay */}
      <div id="toasts">
        {toasts.map((t) => {
          const typeClass = t.type === 'error' ? 'err' : t.type === 'warning' ? 'warn' : 'ok';
          const icon = t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅';
          return (
            <div key={t.id} className={`toast ${typeClass}`}>
              {icon} {t.message}
            </div>
          );
        })}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
