import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 1400);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="splash-overlay" onClick={() => { setVisible(false); if (onFinish) onFinish(); }}>
      <div className="splash-logo-pulse">
        <Sparkles size={36} color="#ffffff" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.25rem'
        }}>
          HabitFlow AI
        </h1>
        <p style={{ color: 'var(--sub)', fontSize: '0.95rem', fontWeight: 600 }}>
          Build Better Habits. Flow with AI.
        </p>
      </div>
    </div>
  );
}
