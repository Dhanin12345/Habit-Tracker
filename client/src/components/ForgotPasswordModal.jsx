import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '', onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Reset token generated.');
        if (data.resetToken) {
          setToken(data.resetToken);
        }
        setStep(2);
      } else {
        setError(data.message || 'Request failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) {
      setError('Please provide both the reset code and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password successfully reset! You can now log in.');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess(email);
        }, 1500);
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <KeyRound size={20} color="var(--accent)" />
            {step === 1 ? 'Reset Your Password' : 'Enter New Password'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--sub)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Enter the email address tied to your HabitFlow AI account. We will issue a secure verification reset token.
              </p>
              <div className="field">
                <label>Account Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-p"
                disabled={loading}
                style={{ justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {loading ? 'Generating Code...' : 'Send Reset Code'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--sub)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Enter the verification token sent to <strong>{email}</strong> and create your new secure password.
              </p>
              <div className="field">
                <label>Reset Token</label>
                <input
                  type="text"
                  placeholder="e.g. HF-849201"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-s"
                  onClick={() => setStep(1)}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-p"
                  disabled={loading}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {loading ? 'Updating...' : 'Set New Password'}
                  <ShieldCheck size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
