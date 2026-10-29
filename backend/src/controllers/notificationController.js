const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

// ------------------------------ Get User Notifications ------------------------------
const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// ------------------------------ Mark Single As Read ------------------------------
const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.user._id, req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: result,
  });
});

// ------------------------------ Mark All As Read ------------------------------
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
    data: result,
  });
});

// ------------------------------ Delete Single Notification ------------------------------
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.user._id, req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully',
    data: result,
  });
});

// ------------------------------ Clear All Notifications ------------------------------
const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.clearAllNotifications(req.user._id);
  res.status(200).json({
    status: 'success',
    message: 'All notifications cleared successfully',
    data: result,
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};

