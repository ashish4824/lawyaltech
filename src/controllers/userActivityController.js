const { UserActivity, ActivityType, DifficultyLevel } = require('../models/UserActivity');
const mongoose = require('mongoose');

class UserActivityController {
  static async recordActivity(req, res) {
    try {
      const { 
        userId, 
        activityType, 
        difficultyLevel = DifficultyLevel.EASY,
        description 
      } = req.body;

      if (!userId || !activityType) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID and Activity Type are required'
        });
      }

   
      const userIdString = String(userId);
      const basePoints = UserActivity.calculatePoints(activityType, difficultyLevel);
      const activity = new UserActivity({
        userId: userIdString,  
        activityType,
        difficultyLevel,
        points: basePoints,
        description
      });

      await activity.save();


      const bonusPoints = await UserActivity.calculateBonusPoints(userIdString);

  
      const totalPoints = basePoints + bonusPoints;

      res.status(201).json({
        status: 'success',
        data: {
          activity,
          basePoints,
          bonusPoints,
          totalPoints
        }
      });
    } catch (error) {
      console.error('Error recording activity:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to record activity',
        error: error.toString()
      });
    }
  }


  static async getDashboardSummary(req, res) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }


      const activitySummary = await UserActivity.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: '$activityType',
            totalActivities: { $sum: 1 },
            totalPoints: { $sum: '$points' }
          }
        }
      ]);

  
      const totalPoints = activitySummary.reduce((sum, activity) => sum + activity.totalPoints, 0);


      const progressBreakdown = activitySummary.map(activity => ({
        type: activity._id,
        activities: activity.totalActivities,
        points: activity.totalPoints,
        percentage: ((activity.totalPoints / totalPoints) * 100).toFixed(2)
      }));

      res.status(200).json({
        status: 'success',
        data: {
          totalPoints,
          activityProgress: progressBreakdown
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve dashboard summary',
        error: error.message
      });
    }
  }

  
  static async getDashboardDetails(req, res) {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }


      const query = { userId: userId };
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const activities = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .limit(50);  

      const stats = {
        totalActivities: activities.length,
        pointsByDifficulty: {},
        activityTypeBreakdown: {}
      };

      activities.forEach(activity => {
        stats.pointsByDifficulty[activity.difficultyLevel] = 
          (stats.pointsByDifficulty[activity.difficultyLevel] || 0) + activity.points;
        stats.activityTypeBreakdown[activity.activityType] = 
          (stats.activityTypeBreakdown[activity.activityType] || 0) + 1;
      });

      res.status(200).json({
        status: 'success',
        data: {
          recentActivities: activities,
          stats
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard details:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve dashboard details',
        error: error.message
      });
    }
  }

  static async getUserActivities(req, res) {
    try {
      const { 
        userId, 
        activityType, 
        difficultyLevel, 
        startDate, 
        endDate,
        limit = 50,
        page = 1 
      } = req.query;

      if (!userId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }

      const query = { 
        userId: userId 
      };

      if (activityType) {
        query.activityType = activityType;
      }
      if (difficultyLevel) {
        query.difficultyLevel = difficultyLevel;
      }

      // Date range filter
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const pageNumber = parseInt(page, 10);
      const pageLimit = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageLimit;

      const activities = await UserActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageLimit);

      const totalActivities = await UserActivity.countDocuments(query);


      const totalPages = Math.ceil(totalActivities / pageLimit);

      if (activities.length === 0) {
        return res.status(404).json({
          status: 'not_found',
          message: 'No activities found for the given user',
          data: {
            activities: [],
            pagination: {
              currentPage: pageNumber,
              totalPages: 0,
              totalActivities: 0,
              limit: pageLimit
            }
          }
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          activities,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalActivities,
            limit: pageLimit
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user activities:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user activities',
        error: error.toString()
      });
    }
  }
}

module.exports = UserActivityController;
