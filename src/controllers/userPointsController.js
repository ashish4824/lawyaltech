const mongoose = require("mongoose");
const { logger } = require('ashish_logger-middleware');

const TaskType = Object.freeze({
  TASK: 'task',
  HIGH_PRIORITY_TASK: 'highPriorityTask',
  ACTIVITY: 'activity'
});

const POINTS_CONFIG = {
  [TaskType.TASK]: {
    basePoints: 10,    
    bonusInterval: 5, 
    bonusPoints: 50    
  },
  [TaskType.HIGH_PRIORITY_TASK]: {
    basePoints: 20,    
    bonusInterval: 3, 
    bonusPoints: 30    
  },
  [TaskType.ACTIVITY]: {
    basePoints: 15,   
    bonusInterval: null,
    bonusPoints: 0
  }
};

const userSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true, 
    unique: true,
    index: true,  
    validate: {
      validator: function(v) {
        return typeof v === 'string' || v instanceof mongoose.Types.ObjectId;
      },
      message: props => `${props.value} is not a valid userId!`
    }
  },
  totalPoints: { 
    type: Number, 
    default: 0, 
    min: 0,
    index: true  
  },
  tasksCompleted: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  highPriorityTasksCompleted: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  activitiesCompleted: { 
    type: Number, 
    default: 0, 
    min: 0 
  }
}, {
  timestamps: true,
  collection: 'user_points'
});

const User = mongoose.model("User", userSchema);

const normalizeUserId = (userId) => {
  try {
    if (userId instanceof mongoose.Types.ObjectId) {
      return userId;
    }
    return new mongoose.Types.ObjectId(userId);
  } catch (error) {
    return userId;
  }
};

const calculatePoints = (user, taskType) => {
  const config = POINTS_CONFIG[taskType];
  let pointsEarned = config.basePoints;

  switch (taskType) {
    case TaskType.TASK:
      if (user.tasksCompleted % config.bonusInterval === 0) {
        pointsEarned += config.bonusPoints;
      }
      break;
    case TaskType.HIGH_PRIORITY_TASK:
      if (user.highPriorityTasksCompleted % config.bonusInterval === 0) {
        pointsEarned += config.bonusPoints;
      }
      break;
  }

  if (user.totalPoints + pointsEarned >= 100) {
    pointsEarned += 100;
  }

  return pointsEarned;
};

const updateUserPoints = async (userId, taskType) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!Object.values(TaskType).includes(taskType)) {
    throw new Error(`Invalid task type: ${taskType}`);
  }

  try {
    // Use findOneAndUpdate with atomic operations
    const updateOperations = {
      $inc: {
        totalPoints: 0, // Placeholder to trigger update
      },
      $set: {}
    };

    // Increment task-specific counter
    switch (taskType) {
      case TaskType.TASK:
        updateOperations.$inc.tasksCompleted = 1;
        break;
      case TaskType.HIGH_PRIORITY_TASK:
        updateOperations.$inc.highPriorityTasksCompleted = 1;
        break;
      case TaskType.ACTIVITY:
        updateOperations.$inc.activitiesCompleted = 1;
        break;
    }

    // Find the user or create if not exists
    const user = await User.findOneAndUpdate(
      { userId: normalizeUserId(userId) }, 
      { $setOnInsert: { userId: normalizeUserId(userId) } }, 
      { 
        upsert: true, 
        new: true 
      }
    );

    // Calculate points after finding/creating user
    const pointsEarned = calculatePoints(user, taskType);

    // Atomic update of points
    const updatedUser = await User.findOneAndUpdate(
      { userId: normalizeUserId(userId) },
      { 
        $inc: { 
          totalPoints: pointsEarned 
        }
      },
      { 
        new: true 
      }
    );

    logger.info(`User ${userId} earned ${pointsEarned} points for ${taskType}`, {
      userId,
      taskType,
      pointsEarned,
      totalPoints: updatedUser.totalPoints
    });

    return { 
      totalPoints: updatedUser.totalPoints,
      pointsEarned,
      taskType 
    };

  } catch (error) {
    logger.error(`Points update failed`, { 
      userId, 
      taskType, 
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name
    });

    throw error;
  }
};

module.exports = { 
  updateUserPoints, 
  TaskType,
  User,
  normalizeUserId 
};
