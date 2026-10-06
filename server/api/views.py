import csv
import datetime
import zoneinfo
import jwt
from django.conf import settings
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from api.models import User, Habit, JournalEntry, UserChallenge
from api.serializers import UserSerializer, HabitSerializer, JournalEntrySerializer, UserChallengeSerializer

def get_user_tz(user):
    tz_name = getattr(user, 'timezone', None) or 'UTC'
    try:
        return zoneinfo.ZoneInfo(tz_name)
    except Exception:
        return datetime.timezone.utc

def get_js_iso_now():
    now = datetime.datetime.now(datetime.timezone.utc)
    return now.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'

def is_today(date_str, user=None):
    try:
        clean_date_str = date_str
        if clean_date_str.endswith('Z'):
            clean_date_str = clean_date_str[:-1] + '+00:00'
        dt = datetime.datetime.fromisoformat(clean_date_str)
        user_tz = get_user_tz(user) if user else datetime.timezone.utc
        user_now = datetime.datetime.now(user_tz)
        return dt.astimezone(user_tz).date() == user_now.date()
    except Exception:
        return False

def calculate_streak(completed_dates, user=None):
    if not completed_dates:
        return 0

    user_tz = get_user_tz(user) if user else datetime.timezone.utc
    parsed_dates = set()
    for d in completed_dates:
        try:
            clean_d = d
            if clean_d.endswith('Z'):
                clean_d = clean_d[:-1] + '+00:00'
            dt = datetime.datetime.fromisoformat(clean_d)
            local_date = dt.astimezone(user_tz).date()
            parsed_dates.add(local_date)
        except Exception:
            continue

    if not parsed_dates:
        return 0

    sorted_dates = sorted(list(parsed_dates), reverse=True)
    today = datetime.datetime.now(user_tz).date()
    yesterday = today - datetime.timedelta(days=1)

    newest_check = sorted_dates[0]

    if newest_check != today and newest_check != yesterday:
        return 0

    start_check = newest_check
    streak = 0

    for i in range(len(sorted_dates)):
        expected_date = start_check - datetime.timedelta(days=i)
        if sorted_dates[i] == expected_date:
            streak += 1
        else:
            break

    return streak

def generate_token(user):
    payload = {
        'id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        'iat': datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

# --- AUTH & USER VIEWS ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not name or not email or not password:
        return Response({'message': 'Please enter all fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            name=name,
            badges=['Starter Badge'],
            goal='🌟 All-round improvement',
            dailyTarget=4,
            bio='',
            timezone='UTC'
        )
        token = generate_token(user)
        return Response({
            'token': token,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': f'Server error during registration: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'message': 'Please enter all fields'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'message': 'Invalid credentials (User not found)'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({'message': 'Invalid credentials (Invalid password)'}, status=status.HTTP_400_BAD_REQUEST)

        token = generate_token(user)
        return Response({
            'token': token,
            'user': UserSerializer(user).data
        })
    except Exception as e:
        return Response({'message': f'Server error during login: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    return Response(UserSerializer(request.user).data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    name = request.data.get('name')
    goal = request.data.get('goal')
    daily_target = request.data.get('dailyTarget')
    bio = request.data.get('bio')
    timezone_val = request.data.get('timezone')

    if name is not None:
        user.name = name.strip()
    if goal is not None:
        user.goal = goal
    if daily_target is not None:
        try:
            user.dailyTarget = max(1, int(daily_target))
        except (ValueError, TypeError):
            pass
    if bio is not None:
        user.bio = bio
    if timezone_val is not None:
        user.timezone = timezone_val

    user.save()
    return Response(UserSerializer(user).data)

# --- HABIT VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def habits_list_create(request):
    if request.method == 'GET':
        include_archived = request.query_params.get('include_archived', 'true').lower() == 'true'
        if include_archived:
            habits = Habit.objects.filter(user=request.user)
        else:
            habits = Habit.objects.filter(user=request.user, isArchived=False)

        for habit in habits:
            current_streak = calculate_streak(habit.completedDates, user=request.user)
            if current_streak != habit.streak:
                habit.streak = current_streak
                if current_streak > habit.longestStreak:
                    habit.longestStreak = current_streak
                habit.save()

        serializer = HabitSerializer(habits, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        title = request.data.get('title')
        description = request.data.get('description', '')
        category = request.data.get('category', 'Health')
        icon = request.data.get('icon', '⭐')
        frequency = request.data.get('frequency', 'Daily')
        priority = request.data.get('priority', 'Medium')
        color = request.data.get('color', '#10b981')
        scheduled_days = request.data.get('scheduledDays', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        reminder_time = request.data.get('reminderTime', '08:00')
        reminder_enabled = request.data.get('reminderEnabled', True)
        target = request.data.get('target', 30)

        if not title:
            return Response({'message': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)

        habit = Habit.objects.create(
            user=request.user,
            title=title,
            description=description,
            category=category,
            icon=icon,
            frequency=frequency,
            priority=priority,
            color=color,
            scheduledDays=scheduled_days,
            reminderTime=reminder_time,
            reminderEnabled=reminder_enabled,
            isArchived=False,
            target=int(target) if target else 30,
            streak=0,
            longestStreak=0,
            completedDates=[],
            skippedDates=[]
        )
        serializer = HabitSerializer(habit)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def habit_detail_update_delete(request, pk):
    try:
        habit = Habit.objects.get(id=pk)
    except Habit.DoesNotExist:
        return Response({'message': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

    if habit.user != request.user:
        return Response({'message': 'Not authorized for this habit'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        serializer = HabitSerializer(habit)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        data = request.data
        if 'title' in data:
            habit.title = data['title']
        if 'description' in data:
            habit.description = data['description']
        if 'category' in data:
            habit.category = data['category']
        if 'icon' in data:
            habit.icon = data['icon']
        if 'frequency' in data:
            habit.frequency = data['frequency']
        if 'priority' in data:
            habit.priority = data['priority']
        if 'color' in data:
            habit.color = data['color']
        if 'scheduledDays' in data:
            habit.scheduledDays = data['scheduledDays']
        if 'reminderTime' in data:
            habit.reminderTime = data['reminderTime']
        if 'reminderEnabled' in data:
            habit.reminderEnabled = bool(data['reminderEnabled'])
        if 'target' in data:
            habit.target = int(data['target'])
        if 'isArchived' in data:
            habit.isArchived = bool(data['isArchived'])

        habit.save()
        return Response(HabitSerializer(habit).data)

    elif request.method == 'DELETE':
        habit.delete()
        return Response({'message': 'Habit deleted successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_archive_toggle(request, pk):
    try:
        habit = Habit.objects.get(id=pk)
    except Habit.DoesNotExist:
        return Response({'message': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

    if habit.user != request.user:
        return Response({'message': 'Not authorized for this habit'}, status=status.HTTP_401_UNAUTHORIZED)

    habit.isArchived = not habit.isArchived
    habit.save()
    return Response(HabitSerializer(habit).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_checkin(request, pk):
    try:
        habit = Habit.objects.get(id=pk)
    except Habit.DoesNotExist:
        return Response({'message': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

    if habit.user != request.user:
        return Response({'message': 'Not authorized to checkin this habit'}, status=status.HTTP_401_UNAUTHORIZED)

    # Check if already completed today
    completed_today = any(is_today(d, user=request.user) for d in habit.completedDates)
    if completed_today:
        return Response({'message': 'Habit already completed today'}, status=status.HTTP_400_BAD_REQUEST)

    # Remove today from skipped dates if checked in
    habit.skippedDates = [d for d in habit.skippedDates if not is_today(d, user=request.user)]

    # Record check-in
    now_str = get_js_iso_now()
    habit.completedDates = list(habit.completedDates) + [now_str]

    # Recalculate streak
    new_streak = calculate_streak(habit.completedDates, user=request.user)
    habit.streak = new_streak
    if new_streak > habit.longestStreak:
        habit.longestStreak = new_streak

    habit.save()

    # --- Badge Awarding Engine ---
    user = request.user
    newly_earned_badges = []

    if 'Starter Badge' not in user.badges:
        newly_earned_badges.append('Starter Badge')

    if new_streak >= 7 and 'Bronze Badge' not in user.badges:
        newly_earned_badges.append('Bronze Badge')
    if new_streak >= 15 and 'Silver Badge' not in user.badges:
        newly_earned_badges.append('Silver Badge')
    if new_streak >= 21 and 'Legend' not in user.badges:
        newly_earned_badges.append('Legend')
    if new_streak >= 30 and 'Gold Badge' not in user.badges:
        newly_earned_badges.append('Gold Badge')

    all_habits = list(Habit.objects.filter(user=user))
    for i, h in enumerate(all_habits):
        if h.id == habit.id:
            all_habits[i] = habit

    total_completions = sum(len(h.completedDates) for h in all_habits)

    if total_completions >= 50 and 'Consistency Master' not in user.badges:
        newly_earned_badges.append('Consistency Master')

    categories_used = set()
    for h in all_habits:
        if len(h.completedDates) > 0:
            categories_used.add(h.category)

    if len(categories_used) >= 3 and 'Diverse Habits' not in user.badges:
        newly_earned_badges.append('Diverse Habits')

    active_habits = [h for h in all_habits if not h.isArchived]
    if len(active_habits) > 0:
        completed_today_count = sum(1 for h in active_habits if any(is_today(d, user=user) for d in h.completedDates))
        if completed_today_count == len(active_habits) and 'Perfect Day' not in user.badges:
            newly_earned_badges.append('Perfect Day')

    if newly_earned_badges:
        user.badges = list(user.badges) + newly_earned_badges
        user.save()

    return Response({
        'habit': HabitSerializer(habit).data,
        'newBadges': newly_earned_badges,
        'badges': user.badges
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def habit_skip(request, pk):
    try:
        habit = Habit.objects.get(id=pk)
    except Habit.DoesNotExist:
        return Response({'message': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

    if habit.user != request.user:
        return Response({'message': 'Not authorized to edit this habit'}, status=status.HTTP_401_UNAUTHORIZED)

    skipped_today = any(is_today(d, user=request.user) for d in habit.skippedDates)
    if skipped_today:
        return Response({'message': 'Habit already skipped today'}, status=status.HTTP_400_BAD_REQUEST)

    habit.completedDates = [d for d in habit.completedDates if not is_today(d, user=request.user)]
    now_str = get_js_iso_now()
    habit.skippedDates = list(habit.skippedDates) + [now_str]

    habit.streak = calculate_streak(habit.completedDates, user=request.user)
    habit.save()

    return Response(HabitSerializer(habit).data)

# --- SERVER-SIDE EXPORT CSV ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_habits_csv(request):
    user = request.user
    habits = Habit.objects.filter(user=user)

    response = HttpResponse(content_type='text/csv')
    today_str = datetime.date.today().isoformat()
    response['Content-Disposition'] = f'attachment; filename="zenhabit_export_{today_str}.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Title', 'Description', 'Category', 'Priority', 'Frequency',
        'Current Streak', 'Longest Streak', 'Target Days', 'Total Check-ins',
        'Reminder Time', 'Reminder Enabled', 'Scheduled Days', 'Status',
        'Created At'
    ])

    for h in habits:
        status_label = 'Archived' if h.isArchived else 'Active'
        scheduled_str = ', '.join(h.scheduledDays) if isinstance(h.scheduledDays, list) else str(h.scheduledDays)
        writer.writerow([
            h.id,
            h.title,
            h.description,
            h.category,
            h.priority,
            h.frequency,
            h.streak,
            h.longestStreak,
            h.target,
            len(h.completedDates),
            h.reminderTime,
            'Yes' if h.reminderEnabled else 'No',
            scheduled_str,
            status_label,
            h.createdAt.strftime('%Y-%m-%d %H:%M:%S') if h.createdAt else ''
        ])

    return response

# --- SMART INSIGHTS & ANALYTICS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_smart_insights(request):
    user = request.user
    user_tz = get_user_tz(user)
    now_local = datetime.datetime.now(user_tz)
    habits = list(Habit.objects.filter(user=user))
    active_habits = [h for h in habits if not h.isArchived]

    total_active = len(active_habits)
    today_done_count = sum(1 for h in active_habits if any(is_today(d, user=user) for d in h.completedDates))
    daily_target = user.dailyTarget if hasattr(user, 'dailyTarget') and user.dailyTarget else 4
    daily_target_pct = min(100, round((today_done_count / daily_target) * 100)) if daily_target > 0 else 0

    best_streak = max((h.streak for h in habits), default=0)
    total_completions = sum(len(h.completedDates) for h in habits)

    # Predictive streak-break detection
    hours_left = max(0, 24 - now_local.hour)
    predictive_streak_breaks = []
    for h in active_habits:
        done_today = any(is_today(d, user=user) for d in h.completedDates)
        if not done_today and h.streak >= 1:
            risk = 'HIGH' if now_local.hour >= 18 else ('MEDIUM' if now_local.hour >= 12 else 'LOW')
            predictive_streak_breaks.append({
                'id': h.id,
                'title': h.title,
                'category': h.category,
                'streak': h.streak,
                'priority': h.priority,
                'risk': risk,
                'hoursLeft': hours_left,
                'message': f'Active streak of {h.streak} days is at risk of breaking!'
            })

    # Focus-habit recommendation (prioritizes High priority uncompleted, then longest at-risk streak)
    focus_habit = None
    uncompleted_active = [h for h in active_habits if not any(is_today(d, user=user) for d in h.completedDates)]
    if uncompleted_active:
        # Sort priority: High -> Medium -> Low, then by streak desc
        priority_weights = {'High': 3, 'Medium': 2, 'Low': 1}
        sorted_candidates = sorted(
            uncompleted_active,
            key=lambda x: (priority_weights.get(x.priority, 1), x.streak),
            reverse=True
        )
        top = sorted_candidates[0]
        focus_habit = {
            'id': top.id,
            'title': top.title,
            'icon': top.icon,
            'category': top.category,
            'priority': top.priority,
            'streak': top.streak,
            'reason': 'Highest priority habit needing completion today to sustain momentum.' if top.priority == 'High' else f'Safeguard your {top.streak}-day streak before the day ends.'
        }

    # Category performance analysis
    categories = ['Health', 'Fitness', 'Study', 'Mindfulness', 'Social', 'Custom']
    category_performance = []
    for cat in categories:
        cat_habits = [h for h in active_habits if h.category == cat]
        cat_total = len(cat_habits)
        cat_completions = sum(len(h.completedDates) for h in cat_habits)
        cat_done_today = sum(1 for h in cat_habits if any(is_today(d, user=user) for d in h.completedDates))
        cat_rate = round((cat_done_today / cat_total) * 100) if cat_total > 0 else 0
        if cat_total > 0:
            category_performance.append({
                'category': cat,
                'habitCount': cat_total,
                'totalCompletions': cat_completions,
                'completionRateToday': cat_rate
            })

    # Smart Habit Recommendations
    existing_cats = {h.category for h in habits}
    catalog_suggestions = [
        {'title': '10-Minute Morning Meditation', 'category': 'Mindfulness', 'icon': '🧘', 'reason': 'Boost mental clarity and reduce stress.'},
        {'title': 'Read 20 Pages Daily', 'category': 'Study', 'icon': '📚', 'reason': 'Compound knowledge and enhance focus.'},
        {'title': 'Drink 2.5L Water Daily', 'category': 'Health', 'icon': '💧', 'reason': 'Maintain optimal energy and metabolism.'},
        {'title': '30-Minute Bodyweight Workout', 'category': 'Fitness', 'icon': '💪', 'reason': 'Build functional strength and endurance.'},
        {'title': 'Evening Journal & Reflection', 'category': 'Mindfulness', 'icon': '📝', 'reason': 'Reflect on wins and reset your mindset.'},
        {'title': 'Reach Out to a Friend or Mentor', 'category': 'Social', 'icon': '🤝', 'reason': 'Nurture relationships and social wellness.'},
    ]
    smart_recommendations = []
    for sug in catalog_suggestions:
        if sug['category'] not in existing_cats or not any(h.title.lower() == sug['title'].lower() for h in habits):
            smart_recommendations.append(sug)
            if len(smart_recommendations) >= 3:
                break

    # Mood vs Habit correlation
    journal_entries = JournalEntry.objects.filter(user=user).order_by('-createdAt')[:14]
    mood_analysis = []
    for entry in journal_entries:
        entry_date_str = entry.createdAt.strftime('%Y-%m-%d')
        # Check habits completed on this date
        habits_completed_on_day = 0
        for h in habits:
            if any(d.startswith(entry_date_str) for d in h.completedDates):
                habits_completed_on_day += 1
        mood_analysis.append({
            'date': entry.date,
            'mood': entry.mood,
            'habitsDone': habits_completed_on_day
        })

    return Response({
        'todayDoneCount': today_done_count,
        'totalActiveHabits': total_active,
        'dailyTarget': daily_target,
        'dailyTargetPct': daily_target_pct,
        'bestStreak': best_streak,
        'totalCompletions': total_completions,
        'predictiveStreakBreaks': predictive_streak_breaks,
        'focusHabit': focus_habit,
        'categoryPerformance': category_performance,
        'smartRecommendations': smart_recommendations,
        'moodAnalysis': mood_analysis,
        'timezone': str(user_tz)
    })

# --- AI HABIT COACH ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_coach_chat(request):
    user = request.user
    prompt = request.data.get('prompt', '').strip()
    habits = list(Habit.objects.filter(user=user, isArchived=False))
    
    total_habits = len(habits)
    best_streak = max((h.streak for h in habits), default=0)
    active_streaks = [h for h in habits if h.streak > 0]
    total_completions = sum(len(h.completedDates) for h in habits)
    high_priority = [h.title for h in habits if h.priority == 'High']

    # Intelligent contextual coaching heuristic engine
    coach_title = "ZenHabit AI Performance Coach"
    if not prompt:
        prompt_preview = "Daily Habit Review & Optimization"
    else:
        prompt_preview = prompt

    tips = []
    if total_habits == 0:
        advice = "Welcome! The key to forming habits is starting small. Choose 1 or 2 micro-habits—such as drinking a glass of water upon waking or reading 5 pages. Consistency always trumps intensity."
        action_plan = [
            "Create your foundational keystone habit today.",
            "Set a specific reminder time aligned with your morning routine.",
            "Aim for 3 consecutive days before expanding."
        ]
    elif len(active_streaks) == 0:
        advice = f"You have {total_habits} active habits, but haven't started an active streak yet. Focus on just ONE habit today—preferably {high_priority[0] if high_priority else habits[0].title}. Completing it once will trigger momentum."
        action_plan = [
            f"Check in '{high_priority[0] if high_priority else habits[0].title}' immediately today.",
            "Use 'Habit Stacking': pair this habit right after brushing your teeth or making coffee.",
            "Celebrate your check-in with the +15 XP reward."
        ]
    elif best_streak >= 14:
        advice = f"Incredible dedication! Your best streak is {best_streak} days, and you've achieved {total_completions} completions. Your neural pathways are locking in this behavior. Be mindful of burnout by ensuring recovery and rewarding yourself."
        action_plan = [
            "Maintain your high-performing streaks without adding too many new simultaneous goals.",
            "Set an accountability checkpoint for reaching day 21 (habit automation milestone).",
            "Reflect on how your energy and productivity have shifted since starting."
        ]
    else:
        advice = f"Great steady progress! You have {len(active_streaks)} ongoing streaks across your habits. To maintain consistency, focus on your High Priority habits first each morning to prevent late-day willpower depletion."
        action_plan = [
            "Tackle your most demanding habit before noon.",
            "Set reminders 30 minutes before your typical free window.",
            "Track daily in your ZenHabit Journal to observe how completions elevate your mood."
        ]

    return Response({
        'coach': coach_title,
        'userQuery': prompt_preview,
        'advice': advice,
        'actionPlan': action_plan,
        'statsSummary': {
            'totalHabits': total_habits,
            'activeStreaks': len(active_streaks),
            'bestStreak': best_streak,
            'totalCompletions': total_completions
        }
    })

# --- JOURNAL VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def journal_list_create(request):
    if request.method == 'GET':
        entries = JournalEntry.objects.filter(user=request.user).order_by('-id')
        serializer = JournalEntrySerializer(entries, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        date = request.data.get('date')
        mood = request.data.get('mood', '🙂')
        text = request.data.get('text', '')

        if not text:
            return Response({'message': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        entry = JournalEntry.objects.create(
            user=request.user,
            date=date,
            mood=mood,
            text=text
        )
        serializer = JournalEntrySerializer(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def journal_delete(request, pk):
    try:
        entry = JournalEntry.objects.get(id=pk)
    except JournalEntry.DoesNotExist:
        return Response({'message': 'Journal entry not found'}, status=status.HTTP_404_NOT_FOUND)

    if entry.user != request.user:
        return Response({'message': 'Not authorized to delete this entry'}, status=status.HTTP_401_UNAUTHORIZED)

    entry.delete()
    return Response({'message': 'Journal entry deleted successfully'})

# --- CHALLENGES VIEWS ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def challenges_list_toggle(request):
    if request.method == 'GET':
        user_chals = UserChallenge.objects.filter(user=request.user)

        if not user_chals.exists():
            defaults = [
                { 'challengeId': 1, 'name': '30-Day Fitness', 'icon': '💪', 'cat': 'Fitness', 'days': 30, 'joined': True, 'prog': 7, 'color': '#f59e0b', 'bg': '#fffbeb' },
                { 'challengeId': 2, 'name': 'Study Streak', 'icon': '📖', 'cat': 'Study', 'days': 21, 'joined': False, 'prog': 0, 'color': '#8b5cf6', 'bg': '#ede9fe' },
                { 'challengeId': 3, 'name': 'Hydration Hero', 'icon': '💧', 'cat': 'Health', 'days': 14, 'joined': True, 'prog': 5, 'color': '#10b981', 'bg': '#ecfdf5' },
                { 'challengeId': 4, 'name': 'Mindful Month', 'icon': '🌸', 'cat': 'Mindfulness', 'days': 30, 'joined': False, 'prog': 0, 'color': '#ec4899', 'bg': '#fdf2f8' },
                { 'challengeId': 5, 'name': 'No Phone Morning', 'icon': '📵', 'cat': 'Custom', 'days': 7, 'joined': False, 'prog': 0, 'color': '#3b82f6', 'bg': '#eff6ff' },
                { 'challengeId': 6, 'name': 'Sleep by 11pm', 'icon': '🌙', 'cat': 'Health', 'days': 14, 'joined': True, 'prog': 9, 'color': '#6366f1', 'bg': '#eef2ff' },
            ]
            for d in defaults:
                UserChallenge.objects.create(user=request.user, **d)
            user_chals = UserChallenge.objects.filter(user=request.user)

        serializer = UserChallengeSerializer(user_chals, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def challenge_toggle_join(request, challenge_id):
    try:
        challenge = UserChallenge.objects.get(user=request.user, challengeId=challenge_id)
    except UserChallenge.DoesNotExist:
        return Response({'message': 'Challenge not found'}, status=status.HTTP_404_NOT_FOUND)

    challenge.joined = not challenge.joined
    if challenge.joined:
        challenge.prog = 1
    else:
        challenge.prog = 0
    challenge.save()

    serializer = UserChallengeSerializer(challenge)
    return Response(serializer.data)
