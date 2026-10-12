const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create an in-app notification and optionally trigger email
   */
  async notify({ recipientId, title, message, type = 'GENERAL', applicationId = '', link = '' }) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        relatedApplicationId: applicationId,
        link
      });

      // Optional email notification log / mock
      if (process.env.EMAIL_ENABLED === 'true') {
        console.log(`[Email Service Mock] Sending email to User ${recipientId}: "${title}" - ${message}`);
      }

      return notification;
    } catch (error) {
      console.error(`[NotificationService] Error creating notification: ${error.message}`);
      return null;
    }
  }

  /**
   * Broadcast announcement to multiple users or a role group
   */
  async broadcast({ userIds, title, message, type = 'GENERAL', link = '' }) {
    try {
      const docs = userIds.map(userId => ({
        recipient: userId,
        title,
        message,
        type,
        link
      }));
      return await Notification.insertMany(docs);
    } catch (error) {
      console.error(`[NotificationService] Broadcast error: ${error.message}`);
      return [];
    }
  }
}

module.exports = new NotificationService();
