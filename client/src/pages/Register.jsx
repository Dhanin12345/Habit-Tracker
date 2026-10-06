import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Register({ onNavigateToLogin, initialEmail = '' }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('🌟 All-round improvement');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const success = await register(name.trim(), email.trim(), password);
      if (success) {
        localStorage.setItem('zh_user_goal', goal);
      }
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setErrorMessage(msg);
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
        <p className="auth-sub">Start your mindful habit journey today.</p>

        <div className="auth-switch">
          <button className="ath" onClick={() => onNavigateToLogin(email)}>Sign In</button>
          <button className="ath on">Register</button>
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
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>⚠️ {errorMessage}</div>
            {errorMessage.toLowerCase().includes('already exists') && (
              <div style={{ marginTop: '0.35rem' }}>
                This account is already registered.{' '}
                <button
                  type="button"
                  onClick={() => onNavigateToLogin(email)}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 9px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                >
                  Sign In to Your Account →
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Primary Goal</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option>📚 Build study habits</option>
              <option>💪 Improve fitness</option>
              <option>🧘 Mental wellness</option>
              <option>💧 Health & hydration</option>
              <option>🌟 All-round improvement</option>
            </select>
          </div>

          <button type="submit" className="btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account?{' '}
          <a onClick={() => onNavigateToLogin(email)} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
