const express = require('express');
const UserActivityController = require('../controllers/userActivityController');

const router = express.Router();

// Middleware to handle async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Dashboard Routes
router.get('/dashboard/summary', asyncHandler(UserActivityController.getDashboardSummary));
router.get('/dashboard/details', asyncHandler(UserActivityController.getDashboardDetails));

// Get User Activities Route
router.get('/activities', asyncHandler(UserActivityController.getUserActivities));

// Activity Recording Route
router.post('/activity', asyncHandler(UserActivityController.recordActivity));

module.exports = router;
