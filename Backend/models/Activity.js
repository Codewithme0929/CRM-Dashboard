const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    entityType: { type: String, enum: ['client', 'task'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
