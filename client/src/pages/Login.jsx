import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, KeyRound, Zap } from 'lucide-react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

export default function Login({ onNavigateToRegister, onBackToLanding, initialEmail = '' }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

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
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@habitflow.ai');
    setPassword('password123');
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await login('demo@habitflow.ai', 'password123');
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
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

        <p className="auth-sub">Smart Habit Tracker & Personal Productivity Platform</p>

        {/* Demo Account Quick Button */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))',
              border: '1.5px solid var(--accent)',
              color: 'var(--accent)',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'transform 0.15s'
            }}
          >
            <Zap size={16} /> 1-Click Demo Login (Instant Access)
          </button>
        </div>

        <div className="auth-switch">
          <button className="ath on">Sign In</button>
          <button className="ath" onClick={() => onNavigateToRegister(email)}>Register</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.35rem'
                }}
              >
                Forgot Password?
              </button>
            </div>
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

          <button type="submit" className="btn" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
            {isSubmitting ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-foot">
          New to HabitFlow?{' '}
          <a onClick={() => onNavigateToRegister(email)} style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent)' }}>
            Create an Account
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

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={email}
        onSuccess={(em) => setEmail(em)}
      />
    </div>
  );
}
