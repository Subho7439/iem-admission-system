const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc    Get notifications for logged in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin send announcement / broadcast
 * @route   POST /api/notifications/broadcast
 * @access  Private (Admin)
 */
const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'student' } = req.body;

    const users = await User.find({ role: targetRole });
    const docs = users.map(u => ({
      recipient: u._id,
      title,
      message,
      type: 'GENERAL',
      link: '/student/dashboard'
    }));

    await Notification.insertMany(docs);

    res.status(200).json({
      success: true,
      message: `Announcement broadcasted to ${users.length} ${targetRole}s`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification
};
