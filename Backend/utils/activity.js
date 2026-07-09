const Activity = require('../models/Activity');

async function logActivity({ entityType, entityId, user, action, message }) {
  try {
    await Activity.create({
      entityType,
      entityId,
      user: user || undefined,
      action,
      message,
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
}

module.exports = { logActivity };
