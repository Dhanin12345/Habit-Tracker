from django.db import models
from django.contrib.auth.models import AbstractUser

def default_scheduled_days():
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    badges = models.JSONField(default=list, blank=True)
    goal = models.CharField(max_length=255, default='🌟 All-round improvement', blank=True)
    dailyTarget = models.IntegerField(default=4)
    bio = models.TextField(blank=True, default='')
    timezone = models.CharField(max_length=100, default='UTC', blank=True)

    def __str__(self):
        return self.email

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=100, default='Health')
    icon = models.CharField(max_length=50, default='⭐')
    frequency = models.CharField(max_length=100, default='Daily')
    priority = models.CharField(max_length=20, default='Medium')  # Low, Medium, High
    color = models.CharField(max_length=50, default='#10b981', blank=True)
    scheduledDays = models.JSONField(default=default_scheduled_days, blank=True)
    reminderTime = models.CharField(max_length=20, default='08:00', blank=True)
    reminderEnabled = models.BooleanField(default=True)
    isArchived = models.BooleanField(default=False)
    target = models.IntegerField(default=30)
    streak = models.IntegerField(default=0)
    longestStreak = models.IntegerField(default=0)
    completedDates = models.JSONField(default=list, blank=True)
    skippedDates = models.JSONField(default=list, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.user.email})"

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='journal_entries')
    date = models.CharField(max_length=100) # e.g. "May 21, 2026"
    mood = models.CharField(max_length=50) # e.g. "😄"
    text = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Journal entry on {self.date} by {self.user.email}"

class UserChallenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    challengeId = models.IntegerField()
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=50)
    cat = models.CharField(max_length=100)
    days = models.IntegerField()
    joined = models.BooleanField(default=False)
    prog = models.IntegerField(default=0)
    color = models.CharField(max_length=50)
    bg = models.CharField(max_length=50)

    def __str__(self):
        return f"Challenge {self.name} of {self.user.email}"
