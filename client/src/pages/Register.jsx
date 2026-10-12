import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Register({ onNavigateToLogin, onBackToLanding, initialEmail = '' }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Sparkles size={22} />
          </div>
          <div style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, var(--text) 30%, var(--accent) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HabitFlow AI
          </div>
        </div>

        <p className="auth-sub">Create your account to unlock AI habit tracking.</p>

        <div className="auth-switch">
          <button className="ath" onClick={() => onNavigateToLogin(email)}>Sign In</button>
          <button className="ath on">Register</button>
        </div>

        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
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
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dhanin"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage('');
              }}
              required
            />
          </div>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              required
            />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrorMessage('');
              }}
              required
            />
          </div>

          <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
            {isSubmitting ? 'Creating Account...' : 'Get Started →'}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account?{' '}
          <a onClick={() => onNavigateToLogin(email)} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>
            Sign In
          </a>
        </p>

        {onBackToLanding && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onBackToLanding}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--sub)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ← Back to Landing Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
