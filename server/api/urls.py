from django.urls import path
from api import views

urlpatterns = [
    # Auth & Profile
    path('auth/register', views.register_user, name='register'),
    path('auth/login', views.login_user, name='login'),
    path('auth/forgot-password', views.forgot_password, name='forgot_password'),
    path('auth/reset-password', views.reset_password, name='reset_password'),
    path('auth/me', views.get_user_data, name='me'),
    path('auth/profile', views.update_user_profile, name='update_profile'),

    # Habit CRUD & Actions
    path('habits', views.habits_list_create, name='habits_list_create'),
    path('habits/<int:pk>', views.habit_detail_update_delete, name='habit_detail_update_delete'),
    path('habits/checkin/<int:pk>', views.habit_checkin, name='habit_checkin'),
    path('habits/skip/<int:pk>', views.habit_skip, name='habit_skip'),
    path('habits/miss/<int:pk>', views.habit_miss, name='habit_miss'),
    path('habits/pending/<int:pk>', views.habit_pending, name='habit_pending'),
    path('habits/pause/<int:pk>', views.habit_pause_toggle, name='habit_pause_toggle'),
    path('habits/archive/<int:pk>', views.habit_archive_toggle, name='habit_archive_toggle'),
    path('habits/duplicate/<int:pk>', views.habit_duplicate, name='habit_duplicate'),
    path('habits/export/csv', views.export_habits_csv, name='export_habits_csv'),
    path('habits/export/json', views.export_habits_json, name='export_habits_json'),

    # Goals
    path('goals', views.goals_list_create, name='goals_list_create'),
    path('goals/<int:pk>', views.goal_detail_update_delete, name='goal_detail_update_delete'),

    # Notifications
    path('notifications', views.notifications_list, name='notifications_list'),
    path('notifications/create', views.notification_create, name='notification_create'),
    path('notifications/read/<int:pk>', views.notification_mark_read, name='notification_mark_read'),
    path('notifications/read-all', views.notifications_read_all, name='notifications_read_all'),
    path('notifications/clear', views.notifications_clear, name='notifications_clear'),

    # Calendar & Analytics
    path('calendar', views.get_calendar_data, name='get_calendar_data'),
    path('analytics', views.get_analytics_data, name='get_analytics_data'),

    # Smart Insights & AI Habit Coach
    path('insights', views.get_smart_insights, name='get_smart_insights'),
    path('ai-coach', views.ai_coach_chat, name='ai_coach_chat'),

    # Admin Dashboard
    path('admin/overview', views.admin_overview, name='admin_overview'),
    path('admin/users', views.admin_users_list, name='admin_users_list'),
    path('admin/users/<int:pk>/toggle-staff', views.admin_toggle_staff, name='admin_toggle_staff'),

    # Journal & Challenges
    path('journal', views.journal_list_create, name='journal_list_create'),
    path('journal/<int:pk>', views.journal_delete, name='journal_delete'),
    path('challenges', views.challenges_list_toggle, name='challenges_list_toggle'),
    path('challenges/join/<int:challenge_id>', views.challenge_toggle_join, name='challenge_toggle_join'),
]
