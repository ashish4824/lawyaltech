const mongoose = require('mongoose');

// Enum for activity types
const ActivityType = Object.freeze({
  LEARNING: 'learning',
  PROJECT: 'project',
  CHALLENGE: 'challenge',
  COLLABORATION: 'collaboration',
  MILESTONE: 'milestone'
});

// Enum for difficulty levels
const DifficultyLevel = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium', 
  HARD: 'hard',
  EXPERT: 'expert'
});

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: Object.values(ActivityType),
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: Object.values(DifficultyLevel),
    default: DifficultyLevel.EASY
  },
  points: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  indexes: [
    { fields: { userId: 1, activityType: 1 } },
    { fields: { timestamp: -1 } }
  ]
});

// Point calculation method
UserActivitySchema.statics.calculatePoints = function(activityType, difficultyLevel) {
  const basePoints = {
    [ActivityType.LEARNING]: {
      [DifficultyLevel.EASY]: 10,
      [DifficultyLevel.MEDIUM]: 25,
      [DifficultyLevel.HARD]: 50,
      [DifficultyLevel.EXPERT]: 100
    },
    [ActivityType.PROJECT]: {
      [DifficultyLevel.EASY]: 20,
      [DifficultyLevel.MEDIUM]: 50,
      [DifficultyLevel.HARD]: 100,
      [DifficultyLevel.EXPERT]: 250
    },
    [ActivityType.CHALLENGE]: {
      [DifficultyLevel.EASY]: 15,
      [DifficultyLevel.MEDIUM]: 40,
      [DifficultyLevel.HARD]: 75,
      [DifficultyLevel.EXPERT]: 150
    },
    [ActivityType.COLLABORATION]: {
      [DifficultyLevel.EASY]: 5,
      [DifficultyLevel.MEDIUM]: 20,
      [DifficultyLevel.HARD]: 45,
      [DifficultyLevel.EXPERT]: 90
    },
    [ActivityType.MILESTONE]: {
      [DifficultyLevel.EASY]: 50,
      [DifficultyLevel.MEDIUM]: 100,
      [DifficultyLevel.HARD]: 200,
      [DifficultyLevel.EXPERT]: 500
    }
  };

  return basePoints[activityType][difficultyLevel] || 0;
};

// Bonus point calculation for streaks and milestones
UserActivitySchema.statics.calculateBonusPoints = async function(userId) {
  const activities = await this.find({ userId });
  
  // Streak bonus
  const dailyActivities = activities.reduce((acc, activity) => {
    const date = activity.timestamp.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const streakDays = Object.keys(dailyActivities).length;
  const streakBonus = Math.floor(streakDays / 7) * 50; // 50 bonus points per week of consistent activity

  // Milestone bonus
  const milestoneActivities = activities.filter(a => a.activityType === ActivityType.MILESTONE);
  const milestoneBonus = milestoneActivities.length * 100;

  return streakBonus + milestoneBonus;
};

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = {
  UserActivity,
  ActivityType,
  DifficultyLevel
};
