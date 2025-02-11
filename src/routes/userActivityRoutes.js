const express = require('express');
const UserActivityController = require('../controllers/userActivityController');

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
router.get('/dashboard/summary', asyncHandler(UserActivityController.getDashboardSummary));
router.get('/dashboard/details', asyncHandler(UserActivityController.getDashboardDetails));
router.get('/activities', asyncHandler(UserActivityController.getUserActivities));
router.post('/activity', asyncHandler(UserActivityController.recordActivity));
module.exports = router;
