from rest_framework import serializers
from api.models import User, Habit, JournalEntry, UserChallenge

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'badges', 'goal', 'dailyTarget', 'bio', 'timezone']

class HabitSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(source='id', read_only=True)
    userId = serializers.CharField(source='user_id', read_only=True)

    class Meta:
        model = Habit
        fields = [
            '_id', 'userId', 'title', 'description', 'category', 'icon',
            'frequency', 'priority', 'color', 'scheduledDays',
            'reminderTime', 'reminderEnabled', 'isArchived',
            'target', 'streak', 'longestStreak', 'completedDates',
            'skippedDates', 'createdAt'
        ]

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'mood', 'text', 'createdAt']

class UserChallengeSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='challengeId')

    class Meta:
        model = UserChallenge
        fields = ['id', 'name', 'icon', 'cat', 'days', 'joined', 'prog', 'color', 'bg']
