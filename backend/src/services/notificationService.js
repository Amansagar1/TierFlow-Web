const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ------------------------------ Safe Creation Helper ------------------------------
const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  amount = null,
  actionUrl = '',
}) => {
  try {
    if (!userId || !title || !message) return null;

    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      amount: amount !== null && !isNaN(amount) ? Number(amount) : null,
      actionUrl,
    });
    return notification;
  } catch (err) {
    logger.warn('Failed to create notification safely:', err.message);
    return null;
  }
};

// ------------------------------ Get User Notifications with Filter ------------------------------
const getUserNotifications = async (userId, query = {}) => {
  const limit = Math.min(parseInt(query.limit, 10) || 20, 50);
  const page = parseInt(query.page, 10) || 1;
  const skip = (page - 1) * limit;
  const filterType = query.filter || 'all';

  const filter = { user: userId };

  if (filterType === 'unread') {
    filter.isRead = false;
  } else if (filterType === 'earnings') {
    filter.type = { $in: ['roi', 'referral'] };
  } else if (filterType === 'system') {
    filter.type = { $in: ['security', 'system', 'investment', 'wallet'] };
  } else if (filterType !== 'all') {
    filter.type = filterType;
  }

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
    unreadCount,
  };
};

// ------------------------------ Mark Single Notification Read ------------------------------
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return { notification, unreadCount };
};

// ------------------------------ Mark All Notifications Read ------------------------------
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return {
    modifiedCount: result.modifiedCount || 0,
    unreadCount: 0,
  };
};

// ------------------------------ Delete Single Notification ------------------------------
const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return { success: true, unreadCount };
};

// ------------------------------ Clear All Notifications ------------------------------
const clearAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ user: userId });

  return {
    deletedCount: result.deletedCount || 0,
    unreadCount: 0,
  };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};

