const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  assignee: String,
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed']
  },
  dueDate: Date,
  subtasks: [
    {
      label: { type: String, required: true },
      done: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);