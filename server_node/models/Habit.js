const mongoose = require('mongoose');
const { createModel } = require('../config/db');

const HabitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  streak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completedDates: {
    type: [Date],
    default: []
  },
  skippedDates: {
    type: [Date],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Habit = createModel('Habit', HabitSchema, 'habits', {
  streak: 0,
  longestStreak: 0,
  completedDates: [],
  skippedDates: [],
  category: 'General',
  createdAt: new Date()
});

module.exports = Habit;
