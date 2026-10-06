from django.urls import path
from api import views

urlpatterns = [
    # Auth & Profile Routes
    path('auth/register', views.register_user, name='register'),
    path('auth/login', views.login_user, name='login'),
    path('auth/me', views.get_user_data, name='me'),
    path('auth/profile', views.update_user_profile, name='update_profile'),
    
    # Habit Routes
    path('habits', views.habits_list_create, name='habits_list_create'),
    path('habits/<int:pk>', views.habit_detail_update_delete, name='habit_detail_update_delete'),
    path('habits/checkin/<int:pk>', views.habit_checkin, name='habit_checkin'),
    path('habits/skip/<int:pk>', views.habit_skip, name='habit_skip'),
    path('habits/archive/<int:pk>', views.habit_archive_toggle, name='habit_archive_toggle'),
    path('habits/export/csv', views.export_habits_csv, name='export_habits_csv'),

    # Smart Insights & AI Habit Coach
    path('insights', views.get_smart_insights, name='get_smart_insights'),
    path('ai-coach', views.ai_coach_chat, name='ai_coach_chat'),

    # Journal Routes
    path('journal', views.journal_list_create, name='journal_list_create'),
    path('journal/<int:pk>', views.journal_delete, name='journal_delete'),

    # Challenge Routes
    path('challenges', views.challenges_list_toggle, name='challenges_list_toggle'),
    path('challenges/join/<int:challenge_id>', views.challenge_toggle_join, name='challenge_toggle_join'),
]
