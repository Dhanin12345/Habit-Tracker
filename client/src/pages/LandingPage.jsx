import React, { useState } from 'react';
import {
  Sparkles, Flame, CheckCircle, Brain, ArrowRight,
  TrendingUp, Calendar, Shield, Award, Users, ChevronRight
} from 'lucide-react';

export default function LandingPage({ onEnterApp, onOpenLogin, onOpenRegister }) {
  const [demoChecked, setDemoChecked] = useState(false);
  const [demoStreak, setDemoStreak] = useState(12);

  const handleDemoCheck = () => {
    if (!demoChecked) {
      setDemoChecked(true);
      setDemoStreak(s => s + 1);
    } else {
      setDemoChecked(false);
      setDemoStreak(s => s - 1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(var(--bg), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }} onClick={onEnterApp}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, var(--text) 30%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              HabitFlow AI
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn-s"
            onClick={onOpenLogin}
            style={{ fontWeight: 700 }}
          >
            Sign In
          </button>
          <button
            type="button"
            className="btn-p"
            onClick={onOpenRegister}
            style={{ fontWeight: 800 }}
          >
            Get Started Free
            <ArrowRight size={15} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lp-hero" style={{
        position: 'relative',
        background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.14) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 75%)',
        overflow: 'hidden'
      }}>
        <div className="lp-badge" style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
          <Sparkles size={14} color="var(--accent)" /> Next-Gen AI Productivity OS
        </div>
        <h1 className="lp-title">
          Build Bulletproof Habits.<br />Flow with Intelligent Coaching.
        </h1>
        <p className="lp-desc">
          The modern habit engineering platform that analyzes your completion patterns, preserves streaks, predicts drop-off risks, and gamifies daily excellence.
        </p>

        <div className="lp-cta-row">
          <button
            type="button"
            className="btn-p"
            style={{ padding: '0.9rem 2rem', fontSize: '1.02rem', borderRadius: '12px' }}
            onClick={onEnterApp}
          >
            ⚡ Open Live App
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="btn-s"
            style={{ padding: '0.9rem 1.85rem', fontSize: '1.02rem', borderRadius: '12px' }}
            onClick={onOpenLogin}
          >
            Sign In to Account
          </button>
        </div>

        {/* Live Interactive Preview Card */}
        <div style={{
          background: 'var(--card)',
          border: '1.5px solid var(--border)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '560px',
          margin: '0 auto',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>💻</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Deep Work & Coding</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sub)' }}>Daily · High Priority</div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.12)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.8rem'
            }}>
              <Flame size={15} /> {demoStreak} Day Streak
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg)',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {demoChecked ? '🎉 Completed for today! (+10 XP)' : '⏳ Scheduled for Today'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>
                Target: 60 Days · 87% Consistency
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoCheck}
              className={`chk-btn ${demoChecked ? 'active completed' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              {demoChecked ? '✓ Completed' : '○ Check In'}
            </button>
          </div>

          <div style={{
            marginTop: '0.85rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: 'var(--text)'
          }}>
            <Brain size={16} color="var(--accent)" />
            <span><strong>AI Coach:</strong> Your peak focus window is between 7 PM and 9 PM. Maintain this routine!</span>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section style={{
        maxWidth: '1000px',
        margin: '2rem auto 4rem',
        padding: '0 1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="sc" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)' }}>50,000+</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)', fontWeight: 700 }}>Habits Successfully Formed</div>
        </div>
        <div className="sc" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#3b82f6' }}>94.2%</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)', fontWeight: 700 }}>Streak Retention Rate</div>
        </div>
        <div className="sc" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>4.9 / 5.0</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)', fontWeight: 700 }}>User Productivity Rating</div>
        </div>
        <div className="sc" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>100% Free</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)', fontWeight: 700 }}>Open Platform & Local DB</div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 5rem', padding: '0 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="lp-badge">System Capabilities</div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>Engineered for Consistency</h2>
          <p style={{ color: 'var(--sub)', maxWidth: '550px', margin: '0.5rem auto 0' }}>
            Everything you need to transform temporary motivation into permanent identity shifts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>🧠</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Habit Coach</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Contextual intelligence that examines your streak patterns, alerts you of streak-break risks before midnight, and suggests optimal habit stacking triggers.
            </p>
          </div>

          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>📅</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>GitHub-Style Heatmap</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Visualize an entire year of daily dedication with an interactive contribution heatmap. Click any single day to inspect exactly what was completed or missed.
            </p>
          </div>

          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>🎮</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Gamification & XP Levels</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Earn +10 XP per completion, +50 XP for 7-day milestones, and unlock tiered achievement badges from Beginner to Habit Master.
            </p>
          </div>

          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Goal Management</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Bind habits to macro milestones. Set 30-day or 60-day target deadlines and watch your progress bars advance automatically with each check-in.
            </p>
          </div>

          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>📊</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Deep Analytics</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Interactive Chart.js breakdowns for weekly completions, category distribution, consistency ratings, and completed vs missed metrics.
            </p>
          </div>

          <div className="goal-card">
            <div style={{ fontSize: '1.8rem' }}>🔔</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Tactile Audio & Reminders</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--sub)', lineHeight: 1.55 }}>
              Web Audio API synthesized chimes celebrate every completed habit. Configure exact reminder windows and notification alerts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section style={{
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        padding: '4rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem' }}>
            Ready to Supercharge Your Habits?
          </h2>
          <p style={{ color: 'var(--sub)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Join thousands of users constructing better routines, crushing daily targets, and leveling up with HabitFlow AI.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-p"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', borderRadius: '12px' }}
              onClick={onEnterApp}
            >
              Start Tracking Now
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
