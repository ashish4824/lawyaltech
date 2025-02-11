const express = require('express');
const { updateUserPoints, normalizeUserId, TaskType } = require('../controllers/userPointsController');
const mongoose = require('mongoose');
const { logger } = require('ashish_logger-middleware');

const router = express.Router();
const User = mongoose.models.User || mongoose.model("User", {
  userId: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  username: String,
  email: String,
  totalPoints: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  highPriorityTasksCompleted: { type: Number, default: 0 },
  activitiesCompleted: { type: Number, default: 0 },
});
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
router.get("/users/dashboard/summary", asyncHandler(async (req, res) => {
  const { 
    userId,     
    aggregate,  
    top = 10    
  } = req.query;
  logger.info(`Dashboard Summary Request: ${userId || 'All Users'}`);

  try {
    // Scenario 1: Aggregate Summary for All Users
    if (aggregate === 'true') {
      const aggregateSummary = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalPoints: { $sum: '$totalPoints' },
            averagePoints: { $avg: '$totalPoints' },
            topUsers: { 
              $push: { 
                userId: '$userId', 
                username: '$username', 
                totalPoints: '$totalPoints' 
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            totalPoints: 1,
            averagePoints: { $round: ['$averagePoints', 2] },
            topUsers: { $slice: ['$topUsers', parseInt(top)] }
          }
        }
      ]);

      return res.status(200).json({
        status: 'success',
        data: aggregateSummary[0] || {}
      });
    }
    if (userId) {
      const user = await User.findOne({ 
        userId: normalizeUserId(userId) 
      });

      if (!user) {
        return res.status(404).json({ 
          error: { 
            message: "User not found", 
            status: 404 
          } 
        });
      }

      return res.json({
        userId: user.userId,
        totalPoints: user.totalPoints,
        progress: {
          tasksCompleted: user.tasksCompleted,
          highPriorityTasksCompleted: user.highPriorityTasksCompleted,
          activitiesCompleted: user.activitiesCompleted,
        },
        ranking: await calculateUserRanking(user)
      });
    }

    // Scenario 3: Default - Top Users Summary
    const topUsers = await User.find()
      .sort({ totalPoints: -1 })
      .limit(parseInt(top))
      .select('userId username totalPoints');

    res.json({
      summary: {
        totalUsers: await User.countDocuments(),
        topUsers: topUsers.map(user => ({
          userId: user.userId,
          username: user.username,
          totalPoints: user.totalPoints
        }))
      }
    });

  } catch (error) {
    logger.error(`Dashboard Summary Error: ${error.message}`);
    res.status(500).json({ 
      error: { 
        message: "Internal server error during dashboard summary retrieval", 
        status: 500 
      } 
    });
  }
}));
async function calculateUserRanking(user) {
  const higherPointUsers = await User.countDocuments({ 
    totalPoints: { $gt: user.totalPoints } 
  });
  return higherPointUsers + 1;  // 1-based ranking
}

router.get("/users/dashboard/details", asyncHandler(async (req, res) => {
  const { 
    userId,     
    dateFrom,  
    dateTo,   
    detailed = 'false',  
    timeframe = 'all'   
  } = req.query;
  logger.info(`Dashboard Details Request: ${userId || 'All Users'}`);
  try {
    // const parsedDateFrom = dateFrom ? new Date(dateFrom) : null;
    const parsedDateTo = dateTo ? new Date(dateTo) : new Date();
    const calculateTimeframe = () => {
      const now = new Date();
      switch (timeframe) {
        case 'day':
          return new Date(now.setHours(now.getHours() - 24));
        case 'week':
          return new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return new Date(now.setMonth(now.getMonth() - 1));
        default:
          return null;
      }
    };
    const timeframeStart = calculateTimeframe();
      if (userId) {
      const user = await User.findOne({ 
        userId: normalizeUserId(userId) 
      });

      if (!user) {
        return res.status(404).json({ 
          error: { 
            message: "User not found", 
            status: 404 
          } 
        });
      }
      if (detailed === 'true') {
        const activityBreakdown = await User.aggregate([
          { $match: { userId: normalizeUserId(userId) } },
          {
            $project: {
              taskTypes: {
                task: {
                  total: '$tasksCompleted',
                  points: { $multiply: ['$tasksCompleted', 10] }
                },
                highPriorityTask: {
                  total: '$highPriorityTasksCompleted',
                  points: { $multiply: ['$highPriorityTasksCompleted', 20] }
                },
                activity: {
                  total: '$activitiesCompleted',
                  points: { $multiply: ['$activitiesCompleted', 15] }
                }
              },
              milestones: {
                taskMilestone: { 
                  reached: { $floor: { $divide: ['$tasksCompleted', 5] } },
                  bonusPoints: { $multiply: [{ $floor: { $divide: ['$tasksCompleted', 5] } }, 50] }
                },
                highPriorityMilestone: {
                  reached: { $floor: { $divide: ['$highPriorityTasksCompleted', 3] } },
                  bonusPoints: { $multiply: [{ $floor: { $divide: ['$highPriorityTasksCompleted', 3] } }, 30] }
                }
              }
            }
          }
        ]);

        return res.json({
          userId: user.userId,
          totalPoints: user.totalPoints,
          detailedBreakdown: activityBreakdown[0]
        });
      }
      return res.json({
        userId: user.userId,
        totalPoints: user.totalPoints,
        progress: {
          tasksCompleted: user.tasksCompleted,
          highPriorityTasksCompleted: user.highPriorityTasksCompleted,
          activitiesCompleted: user.activitiesCompleted,
        },
        ranking: await calculateUserRanking(user)
      });
    }
    const aggregateDetails = await User.aggregate([
      ...(timeframeStart ? [{ 
        $match: { 
          createdAt: { 
            $gte: timeframeStart, 
            $lte: parsedDateTo 
          } 
        } 
      }] : []),
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$totalPoints' },
          averagePoints: { $avg: '$totalPoints' },
          totalTasks: { $sum: '$tasksCompleted' },
          totalHighPriorityTasks: { $sum: '$highPriorityTasksCompleted' },
          totalActivities: { $sum: '$activitiesCompleted' }
        }
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          totalPoints: 1,
          averagePoints: { $round: ['$averagePoints', 2] },
          activitySummary: {
            tasks: '$totalTasks',
            highPriorityTasks: '$totalHighPriorityTasks',
            activities: '$totalActivities'
          }
        }
      }
    ]);

    res.json(aggregateDetails[0] || {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      activitySummary: {
        tasks: 0,
        highPriorityTasks: 0,
        activities: 0
      }
    });

  } catch (error) {
    logger.error(`Dashboard Details Error: ${error.message}`);
    res.status(500).json({ 
      error: { 
        message: "Internal server error during dashboard details retrieval", 
        status: 500 
      } 
    });
  }
}));

router.post("/users/update", asyncHandler(async (req, res) => {
  const { 
    userId, 
    taskType 
  } = req.body;
  logger.info(`Points Update Request Received`, { 
    userId, 
    taskType,
    requestBody: req.body 
  });

  // Validate input
  if (!userId) {
    logger.warn('Points update failed: Missing User ID', { 
      requestBody: req.body 
    });
    return res.status(400).json({ 
      error: { 
        message: "User ID is required", 
        status: 400 
      } 
    });
  }

  if (!Object.values(TaskType).includes(taskType)) {
    return res.status(400).json({ 
      error: { 
        message: "Invalid task type", 
        status: 400 
      } 
    });
  }

  try {
    const pointsUpdate = await updateUserPoints(userId, taskType);
    logger.info(`Points updated for user ${userId}: ${pointsUpdate.pointsEarned} points`);
    res.status(200).json({
      message: "Points updated successfully",
      ...pointsUpdate
    });
  } catch (error) {
    logger.error(`Points Update Error: ${error.message}`);
    res.status(500).json({ 
      error: { 
        message: "Internal server error updating points", 
        status: 500 
      } 
    });
  }
}));

router.post("/users/create", asyncHandler(async (req, res) => {
  const { 
    userId, 
    username, 
    email, 
    initialPoints = 0 
  } = req.body;

  logger.info(`User Creation Request: ${userId}`);

  const validationErrors = [];
  if (!userId) validationErrors.push("User ID is required");
  if (!username) validationErrors.push("Username is required");
  if (!email) validationErrors.push("Email is required");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    validationErrors.push("Invalid email format");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: { 
        message: validationErrors.join(", "), 
        status: 400 
      } 
    });
  }

  try {
    const existingUser = await User.findOne({ 
      $or: [
        { userId: normalizeUserId(userId) },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: { 
          message: "User already exists with this ID or email", 
          status: 409 
        } 
      });
    }

    const newUser = new User({
      userId: normalizeUserId(userId),
      username,
      email,
      totalPoints: initialPoints,
      tasksCompleted: 0,
      highPriorityTasksCompleted: 0,
      activitiesCompleted: 0
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      userId: newUser.userId,
      username: newUser.username,
      totalPoints: newUser.totalPoints
    });

  } catch (error) {
    logger.error(`User Creation Error: ${error.message}`);

    res.status(500).json({ 
      error: { 
        message: "Internal server error during user creation", 
        status: 500 
      } 
    });
  }
}));

router.post("/users/update-points", asyncHandler(async (req, res) => {
  const { 
    userId, 
    taskType 
  } = req.body;
  if (!userId) {
    return res.status(400).json({ 
      error: { 
        message: "User ID is required", 
        status: 400 
      } 
    });
  }

  if (!Object.values(TaskType).includes(taskType)) {
    return res.status(400).json({ 
      error: { 
        message: "Invalid task type", 
        status: 400 
      } 
    });
  }

  try {
    const pointsUpdate = await updateUserPoints(userId, taskType);

    logger.info(`Points updated for user ${userId}: ${pointsUpdate.pointsEarned} points`);

    res.status(200).json({
      message: "Points updated successfully",
      ...pointsUpdate
    });
  } catch (error) {
    logger.error(`Points Update Error: ${error.message}`);
    res.status(500).json({ 
      error: { 
        message: "Internal server error updating points", 
        status: 500 
      } 
    });
  }
}));

console.log('UserPoints Routes Loaded:', router.stack.map(r => r.route.path));

module.exports = router;
