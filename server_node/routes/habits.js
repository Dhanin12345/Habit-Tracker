const router = require('express').Router();
const Habit = require('../models/Habit');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper to calculate current streak
function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  
  // Format to local date timestamps to eliminate timezone offsets and remove duplicates
  const uniqueDateStrings = [...new Set(dates.map(d => {
    const dateObj = new Date(d);
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
  }))];
  
  // Sort in descending order (newest first)
  uniqueDateStrings.sort((a, b) => b - a);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;
  
  const newestCheck = uniqueDateStrings[0];
  
  // If the newest check-in is neither today nor yesterday, streak is broken
  if (newestCheck !== todayMs && newestCheck !== yesterdayMs) {
    return 0;
  }
  
  // Determine starting point of checking
  const startCheckMs = newestCheck;
  let streak = 0;
  
  for (let i = 0; i < uniqueDateStrings.length; i++) {
    const expectedTime = startCheckMs - i * 24 * 60 * 60 * 1000;
    if (uniqueDateStrings[i] === expectedTime) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// GET ALL HABITS FOR USER
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId });
    
    // Recalculate streak on-the-fly to ensure accuracy if days have passed
    for (let habit of habits) {
      const currentStreak = calculateStreak(habit.completedDates);
      if (currentStreak !== habit.streak) {
        habit.streak = currentStreak;
        if (currentStreak > (habit.longestStreak || 0)) {
          habit.longestStreak = currentStreak;
        }
        // Save the updated streak in the DB
        if (typeof habit.save === 'function') {
          await habit.save();
        }
      }
    }
    
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habits', error: error.message });
  }
});

// CREATE A HABIT
router.post('/', auth, async (req, res) => {
  const { title, category } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const habit = new Habit({
      userId: req.userId,
      title,
      category: category || 'General',
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      skippedDates: []
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating habit', error: error.message });
  }
});

// DELETE A HABIT
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.userId !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to delete this habit' });
    }

    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit', error: error.message });
  }
});

// CHECKIN HABIT
router.post('/checkin/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.userId !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to checkin this habit' });
    }

    // Check if already completed today
    const todayStr = new Date().toDateString();
    const alreadyCompleted = habit.completedDates.some(
      date => new Date(date).toDateString() === todayStr
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Habit already completed today' });
    }

    // Remove today from skipped dates if checked in
    habit.skippedDates = habit.skippedDates.filter(
      date => new Date(date).toDateString() !== todayStr
    );

    // Record check-in
    habit.completedDates.push(new Date());
    
    // Recalculate streak
    const newStreak = calculateStreak(habit.completedDates);
    habit.streak = newStreak;
    if (newStreak > (habit.longestStreak || 0)) {
      habit.longestStreak = newStreak;
    }

    await habit.save();

    // --- Badge Awarding Engine ---
    const user = await User.findById(req.userId);
    const newlyEarnedBadges = [];

    // Starter Badge - first completion
    if (!user.badges.includes('Starter Badge')) {
      newlyEarnedBadges.push('Starter Badge');
    }

    // Streak Badges
    if (newStreak >= 7 && !user.badges.includes('Bronze Badge')) {
      newlyEarnedBadges.push('Bronze Badge');
    }
    if (newStreak >= 15 && !user.badges.includes('Silver Badge')) {
      newlyEarnedBadges.push('Silver Badge');
    }
    if (newStreak >= 30 && !user.badges.includes('Gold Badge')) {
      newlyEarnedBadges.push('Gold Badge');
    }

    // Fetch all habits to check global statistics
    const allHabits = await Habit.find({ userId: req.userId });
    
    // Consistency Master - total completions across all habits >= 50
    const totalCompletions = allHabits.reduce((acc, h) => acc + h.completedDates.length, 0);
    if (totalCompletions >= 50 && !user.badges.includes('Consistency Master')) {
      newlyEarnedBadges.push('Consistency Master');
    }

    // Diverse Habits - checkins in 3+ categories
    const categoriesUsed = new Set();
    allHabits.forEach(h => {
      if (h.completedDates.length > 0) {
        categoriesUsed.add(h.category);
      }
    });
    if (categoriesUsed.size >= 3 && !user.badges.includes('Diverse Habits')) {
      newlyEarnedBadges.push('Diverse Habits');
    }

    // Update user badges if there are new ones
    if (newlyEarnedBadges.length > 0) {
      user.badges = [...user.badges, ...newlyEarnedBadges];
      // Handled for both Mongoose and custom JSON models
      if (typeof user.save === 'function') {
        await user.save();
      }
    }

    res.json({
      habit,
      newBadges: newlyEarnedBadges,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
});

// SKIP HABIT
router.post('/skip/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.userId !== req.userId) {
      return res.status(401).json({ message: 'Not authorized to edit this habit' });
    }

    // Check if already skipped today
    const todayStr = new Date().toDateString();
    const alreadySkipped = habit.skippedDates.some(
      date => new Date(date).toDateString() === todayStr
    );

    if (alreadySkipped) {
      return res.status(400).json({ message: 'Habit already skipped today' });
    }

    // Remove today from completed dates if skipping
    habit.completedDates = habit.completedDates.filter(
      date => new Date(date).toDateString() !== todayStr
    );

    // Record skip
    habit.skippedDates.push(new Date());

    // Recalculate streak (skipping breaks current streak since they missed it)
    habit.streak = calculateStreak(habit.completedDates);

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Error skipping habit', error: error.message });
  }
});

module.exports = router;
