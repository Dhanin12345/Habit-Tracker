# HabitFlow AI – Smart Habit Tracker & Personal Productivity Platform

> **A modern, responsive, full-stack productivity & habit tracking platform built with React + Vite, Chart.js, Lucide Icons, and Django REST Framework / Python.**  
> Designed as a real SaaS productivity product with AI coaching, smart streak protection, GitHub-style 52-week heatmaps, gamified XP leveling, and an enterprise admin portal.

---

## 🚀 1. Project Overview & Master Specification

**HabitFlow AI** is designed to look and feel like a modern SaaS productivity powerhouse (similar to Linear, Notion, and Superhuman), rather than a basic CRUD demo. It incorporates behavioral psychology, atomic habit stacking, tactile audio feedback via the Web Audio API, and contextual AI recommendations.

### Key Capabilities Matrix
- **Authentication & Security**: JWT Authentication (`PyJWT`), password hashing via Django, role-based authorization, protected endpoints, and 2-step password reset tokens.
- **SaaS Marketing Landing Page**: High-conversion landing page with hero ambient lighting, trust metrics, interactive habit check-in preview, and feature grid.
- **Advanced Dashboard UI**: Topbar greeting, localized live date, daily target meter, KPI cards (Total Habits, Completed Today, Active Streak, Completion Rate), high-leverage focus habit card, and today's 4-state check-in system.
- **Complete Habit Management**:
  - Full CRUD + Pause / Resume + 1-Click Duplicate + Archive / Unarchive.
  - Multi-category organization across 10 default categories + custom category creation.
  - Multi-frequency support: Daily, Specific Weekdays, Weekly (3x/wk, 5x/wk), Monthly (10x/mo, 20x/mo), and Custom.
  - Priority levels (🔴 High, 🟡 Medium, 🔵 Low) and customizable color palettes.
- **Tactile 4-State Daily Check-In**:
  - ✓ **Completed** (Awards +10 XP, triggers Web Audio chime, updates streaks and progress).
  - ✗ **Missed** (Records missed date and resets active streak).
  - ⏸ **Skipped** (Freezes streak on rest days without breaking momentum).
  - ⏳ **Pending** (Default scheduled state for current day).
- **GitHub-Style Contribution Heatmap**:
  - 52-week annual matrix with multi-tiered emerald intensity scaling.
  - Interactive Day Inspector modal: click any date square to inspect all completed, missed, or pending habits on that date.
  - Filter heatmap by specific individual habit or view all habits combined.
- **Goals & Milestone Management**:
  - Macro-level goals with target days, deadlines, and linked habits.
  - Automatic milestone progress advancement whenever linked habits are completed.
- **Gamification & XP Engine**:
  - XP rewards: +10 XP per completion, +50 XP for 7-day streak, +200 XP for 30-day streak, +25 XP for habit creation, +80 XP for badge unlocks.
  - 5 Progressive Ranks: Level 1 (Beginner), Level 2 (Consistent), Level 3 (Disciplined), Level 4 (Focused), Level 5 (Habit Master).
  - Badges: *Starter Badge*, *7 Day Streak*, *30 Day Streak*, *100 Completions*, *Consistency Master*, *Diverse Habits*, *Perfect Day*, *Legend*.
- **AI Habit Coach & Smart Recommendations**:
  - Contextual behavioral analysis of habit counts, completion times, and drop-off risks.
  - Interactive chat coach providing habit stacking and willpower preservation strategies.
  - 1-click add curated recommendations (Drink 2L Water, 1h Coding Practice, 20m Reading, etc.).
- **Tactile Audio & In-App Notification Center**:
  - Web Audio API synthesizer for instant completion chimes, streak chords, and level-up fanfares without external audio files.
  - In-app notification feed with read/unread tracking, test alert triggers, and native browser push permission support.
- **Enterprise Admin Portal**:
  - System telemetry (Total Users, Active Users, Total Habits, Total Completions, Server Uptime).
  - User management table with live staff promotion/demotion and audit activity logs.

---

## 🛠️ 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, Vite | High-performance SPA with instant HMR |
| **Styling** | Modern CSS Design System | Custom tokens, dark/light theme engine, glassmorphism, responsive grid |
| **Iconography & Charts** | Lucide Icons, Chart.js | SVG iconography & responsive canvas charts |
| **Backend** | Python 3.10+, Django 5.x | High-throughput web framework |
| **API Layer** | Django REST Framework (DRF) | Token-authenticated RESTful API endpoints |
| **Database** | SQLite3 | Local relational storage with automated migrations |
| **Authentication** | JSON Web Tokens (`PyJWT`) | Stateless 7-day authentication tokens |
| **Audio** | Web Audio API | Pure browser audio synthesis for tactile feedback |

---

## 📂 3. System Architecture & Folder Structure

```
habit-tracker/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateHabitModal.jsx   # Multi-category habit creation & edit modal
│   │   │   ├── DayInspectorModal.jsx  # Interactive heatmap date inspector
│   │   │   ├── ForgotPasswordModal.jsx# 2-step verification password reset
│   │   │   ├── HabitDetailModal.jsx   # Habit stats & 90-day mini-heatmap
│   │   │   ├── Navbar.jsx             # Sidebar navigation, audio & theme toggle
│   │   │   └── SplashScreen.jsx       # Animated HabitFlow AI intro
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # JWT session, toast notifications, auth state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Telemetry, user accounts table & audit logs
│   │   │   ├── Analytics.jsx          # Chart.js weekly, category, and streak charts
│   │   │   ├── Badges.jsx             # XP progress, ranks, and unlocked badges
│   │   │   ├── CalendarView.jsx       # 52-week GitHub-style habit heatmap
│   │   │   ├── Challenges.jsx         # 30-day community challenges
│   │   │   ├── Dashboard.jsx          # KPI cards, today's 4-state check-in, focus habit
│   │   │   ├── Goals.jsx              # Milestone goals with linked habit progress
│   │   │   ├── Habits.jsx             # Full habit management, filters, duplicates
│   │   │   ├── History.jsx            # Chronological check-in activity timeline
│   │   │   ├── Insights.jsx           # AI Habit Coach chat & smart recommendations
│   │   │   ├── Journal.jsx            # Daily mood selection & reflection log
│   │   │   ├── LandingPage.jsx        # SaaS marketing landing page
│   │   │   ├── Login.jsx              # Sign-in with 1-click Demo Account
│   │   │   ├── Notifications.jsx      # In-app notification center & sound controls
│   │   │   ├── Profile.jsx            # User profile, bio, timezone, daily targets
│   │   │   ├── Register.jsx           # User registration
│   │   │   └── Settings.jsx           # Dark mode, audio toggles, CSV & JSON export
│   │   ├── utils/
│   │   │   └── sound.js               # Web Audio API chime synthesizer
│   │   ├── App.jsx                    # Master application container & routing
│   │   └── index.css                  # Modern design tokens & stylesheet
│   └── package.json
│
├── server/                     # Backend (Django REST Framework)
│   ├── api/
│   │   ├── authentication.py   # JWT Bearer token authentication middleware
│   │   ├── models.py           # Relational models: User, Habit, Goal, Notification...
│   │   ├── serializers.py      # DRF ModelSerializers
│   │   ├── urls.py             # API route endpoints
│   │   └── views.py            # Complete business logic & streak mathematics
│   ├── server/                 # Django settings & wsgi
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

---

## 🗄️ 4. Database Schema

The relational database architecture is defined in `server/api/models.py`:

```
users
 ├── id, name, email, password_hash
 ├── badges (JSON list)
 ├── goal, dailyTarget, bio, timezone, resetToken
 └── is_staff, date_joined

habits
 ├── id, user_id (FK)
 ├── title, description, category, icon, color
 ├── frequency, scheduledDays (JSON list)
 ├── priority, target, startDate, targetDate
 ├── reminderTime, reminderEnabled
 ├── status (active, paused, archived)
 ├── streak, longestStreak
 ├── completedDates, skippedDates, missedDates (JSON lists)
 └── createdAt, updatedAt

goals
 ├── id, user_id (FK)
 ├── title, description, target, progress, deadline
 ├── relatedHabits (JSON list)
 └── status (in_progress, achieved)

notifications
 ├── id, user_id (FK)
 ├── title, message, type (reminder, streak, achievement, ai)
 ├── readStatus
 └── createdAt
```

---

## 🌐 5. REST API Endpoints

### Authentication & User
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Sign in & receive JWT token
- `POST /api/auth/forgot-password` — Generate password reset verification token
- `POST /api/auth/reset-password` — Reset password using token
- `GET  /api/auth/me` — Get authenticated user details
- `PUT  /api/auth/profile` — Update user bio, timezone, daily targets

### Habits CRUD & Actions
- `GET    /api/habits` — List habits (supports `category`, `status`, `search`, `priority`)
- `POST   /api/habits` — Create new habit
- `GET    /api/habits/<id>` — Get single habit
- `PUT    /api/habits/<id>` — Update habit
- `DELETE /api/habits/<id>` — Delete habit
- `POST   /api/habits/checkin/<id>` — Mark completed for today (recalculates streaks & awards XP)
- `POST   /api/habits/skip/<id>` — Mark skipped (freezes streak)
- `POST   /api/habits/miss/<id>` — Mark missed (resets streak)
- `POST   /api/habits/pending/<id>` — Reset check-in state back to pending
- `POST   /api/habits/pause/<id>` — Toggle Pause / Resume
- `POST   /api/habits/archive/<id>` — Toggle Archive / Unarchive
- `POST   /api/habits/duplicate/<id>` — 1-Click duplicate habit
- `GET    /api/habits/export/csv` — Stream RFC-compliant CSV download
- `GET    /api/habits/export/json` — Download full JSON backup

### Heatmap Calendar & Analytics
- `GET /api/calendar` — 365-day contribution matrix data & day breakdown
- `GET /api/analytics` — KPI cards, weekly charts, category distribution, consistency ratings

### Goals & Notifications
- `GET    /api/goals` — List active and achieved goals
- `POST   /api/goals` — Create new goal
- `PUT    /api/goals/<id>` — Update goal progress or status
- `DELETE /api/goals/<id>` — Delete goal
- `GET    /api/notifications` — List in-app notifications
- `POST   /api/notifications/read/<id>` — Mark notification as read
- `POST   /api/notifications/read-all` — Mark all as read
- `DELETE /api/notifications/clear` — Clear all notifications

### AI Habit Coach & Admin
- `GET  /api/insights` — Predictive streak risk analysis, focus habit recommendation
- `POST /api/ai-coach` — Interactive conversational AI performance coach
- `GET  /api/admin/overview` — System metrics, popular categories, audit events
- `GET  /api/admin/users` — List registered users with habits & completions counts
- `POST /api/admin/users/<id>/toggle-staff` — Promote/demote staff role

---

## ⚡ 6. Running Locally

### Backend Setup (Django)
```bash
cd server
.\.venv\Scripts\activate       # Or source .venv/bin/activate on Linux/Mac
python manage.py migrate
python manage.py runserver 8000
```

### Frontend Setup (Vite + React)
```bash
cd client
npm install
npm run dev                    # Runs Vite on http://localhost:3000 with API proxy
```

### Pre-configured Demo Login
- **Email**: `demo@habitflow.ai`
- **Password**: `password123`
- Click the **"1-Click Demo Login"** button on the Login page for instant access.

---

## 🏆 Summary of Features Implemented
1. **Splash Screen**: Animated launch screen with smooth auto-dismissal.
2. **Landing Page**: Full marketing SaaS landing page with interactive preview.
3. **Login / Register / Forgot Password**: JWT authentication with 1-click Demo Fill and reset code verification.
4. **Dashboard**: Daily greeting, KPI cards, 4-state check-in buttons, weekly consistency meter.
5. **My Habits**: Search, 10 category chips, status tabs (Active/Paused/Archived), duplicate, pause, edit, archive.
6. **Habit Details Modal**: Detailed metrics, 90-day mini-heatmap, and activity log.
7. **Calendar Heatmap**: 52-week contribution matrix with day inspector modal on click.
8. **Goal Management**: Milestone targets, deadlines, automatic linked-habit progress.
9. **Analytics Dashboard**: Chart.js weekly and category breakdown charts.
10. **Achievements**: XP level progression (Level 1-5) and milestone badges.
11. **Notifications Center**: In-app notifications feed, audio testing, and desktop alerts permission.
12. **AI Habit Coach**: Behavioral drop-off risk analysis, interactive chat, smart 1-click recommendations.
13. **Audio Synthesizer**: Web Audio API completion chimes and streak fanfare.
14. **Admin Portal**: System telemetry, user management, and audit log.
15. **Dark / Light Mode**: Clean theme engine with automatic system preference detection.
16. **Data Export**: Server-generated CSV and JSON data export.
