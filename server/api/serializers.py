from rest_framework import serializers
from api.models import User, Habit, JournalEntry, UserChallenge, Goal, Notification

class UserSerializer(serializers.ModelSerializer):
    isAdmin = serializers.BooleanField(source='is_staff', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'badges', 'goal', 'dailyTarget', 'bio', 'timezone', 'isAdmin']

class HabitSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(source='id', read_only=True)
    userId = serializers.CharField(source='user_id', read_only=True)

    class Meta:
        model = Habit
        fields = [
            '_id', 'id', 'userId', 'title', 'description', 'category', 'icon',
            'frequency', 'priority', 'color', 'scheduledDays',
            'reminderTime', 'reminderEnabled', 'isArchived', 'status',
            'target', 'streak', 'longestStreak', 'completedDates',
            'skippedDates', 'missedDates', 'startDate', 'targetDate',
            'createdAt', 'updatedAt'
        ]

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'description', 'target', 'progress', 'deadline', 'relatedHabits', 'status', 'createdAt']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'readStatus', 'createdAt']

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'mood', 'text', 'createdAt']

class UserChallengeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='challengeId')

    class Meta:
        model = UserChallenge
        fields = ['id', 'name', 'icon', 'cat', 'days', 'joined', 'prog', 'color', 'bg']
