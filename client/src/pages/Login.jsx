import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Login({ onNavigateToRegister, initialEmail = '' }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-leaf">🌿</div>
          <div className="brand-name">ZenHabit</div>
        </div>
        <p className="auth-sub">A mindful habit tracker to help you build consistent routines.</p>

        <div className="auth-switch">
          <button className="ath on">Sign In</button>
          <button className="ath" onClick={() => onNavigateToRegister(email)}>Register</button>
        </div>

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '10px',
            padding: '0.75rem 0.9rem',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            lineHeight: 1.4,
            fontWeight: 700
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-foot">
          New here?{' '}
          <a onClick={() => onNavigateToRegister(email)} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
