const path = require('path');
const fs = require('fs');
const express = require('express');
const Client = require('../models/Client');
const Task = require('../models/Task');
const ClientNote = require('../models/ClientNote');
const TaskComment = require('../models/TaskComment');
const Attachment = require('../models/Attachment');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { logActivity } = require('../utils/activity');

const router = express.Router();

// ---------------------------------------------------------------------------
// Client notes
// ---------------------------------------------------------------------------

router.get('/clients/:id/notes', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const notes = await ClientNote.find({ client: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch notes', error: error.message });
  }
});

router.post('/clients/:id/notes', protect, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const note = await ClientNote.create({
      client: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    await logActivity({
      entityType: 'client',
      entityId: client._id,
      user: req.user._id,
      action: 'note_added',
      message: `${req.user.name} added a note`,
    });

    const populated = await ClientNote.findById(note._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to add note', error: error.message });
  }
});

router.delete('/clients/:id/notes/:noteId', protect, async (req, res) => {
  try {
    const note = await ClientNote.findOneAndDelete({
      _id: req.params.noteId,
      client: req.params.id,
    });

    if (!note) return res.status(404).json({ message: 'Note not found' });

    await logActivity({
      entityType: 'client',
      entityId: req.params.id,
      user: req.user._id,
      action: 'note_deleted',
      message: `${req.user.name} deleted a note`,
    });

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete note', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Client files
// ---------------------------------------------------------------------------

router.get('/clients/:id/files', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const files = await Attachment.find({ client: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch files', error: error.message });
  }
});

router.post('/clients/:id/files', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const attachment = await Attachment.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      client: req.params.id,
      uploadedBy: req.user._id,
    });

    await logActivity({
      entityType: 'client',
      entityId: client._id,
      user: req.user._id,
      action: 'file_uploaded',
      message: `${req.user.name} uploaded "${req.file.originalname}"`,
    });

    const populated = await Attachment.findById(attachment._id).populate('uploadedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to upload file', error: error.message });
  }
});

router.delete('/clients/:id/files/:fileId', protect, async (req, res) => {
  try {
    const attachment = await Attachment.findOneAndDelete({
      _id: req.params.fileId,
      client: req.params.id,
    });

    if (!attachment) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await logActivity({
      entityType: 'client',
      entityId: req.params.id,
      user: req.user._id,
      action: 'file_deleted',
      message: `${req.user.name} deleted "${attachment.originalName}"`,
    });

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete file', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Client activity
// ---------------------------------------------------------------------------

router.get('/clients/:id/activity', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const activities = await Activity.find({
      entityType: 'client',
      entityId: req.params.id,
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch activity', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task comments
// ---------------------------------------------------------------------------

router.get('/tasks/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comments = await TaskComment.find({ task: req.params.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch comments', error: error.message });
  }
});

router.post('/tasks/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await TaskComment.create({
      task: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    await logActivity({
      entityType: 'task',
      entityId: task._id,
      user: req.user._id,
      action: 'comment_added',
      message: `${req.user.name} added a comment`,
    });

    const populated = await TaskComment.findById(comment._id).populate('user', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to add comment', error: error.message });
  }
});

router.delete('/tasks/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await TaskComment.findOneAndDelete({
      _id: req.params.commentId,
      task: req.params.id,
    });

    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await logActivity({
      entityType: 'task',
      entityId: req.params.id,
      user: req.user._id,
      action: 'comment_deleted',
      message: `${req.user.name} deleted a comment`,
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete comment', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task files
// ---------------------------------------------------------------------------

router.get('/tasks/:id/files', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const files = await Attachment.find({ task: req.params.id })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch files', error: error.message });
  }
});

router.post('/tasks/:id/files', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const attachment = await Attachment.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      task: req.params.id,
      uploadedBy: req.user._id,
    });

    await logActivity({
      entityType: 'task',
      entityId: task._id,
      user: req.user._id,
      action: 'file_uploaded',
      message: `${req.user.name} uploaded "${req.file.originalname}"`,
    });

    const populated = await Attachment.findById(attachment._id).populate('uploadedBy', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to upload file', error: error.message });
  }
});

router.delete('/tasks/:id/files/:fileId', protect, async (req, res) => {
  try {
    const attachment = await Attachment.findOneAndDelete({
      _id: req.params.fileId,
      task: req.params.id,
    });

    if (!attachment) return res.status(404).json({ message: 'File not found' });

    const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await logActivity({
      entityType: 'task',
      entityId: req.params.id,
      user: req.user._id,
      action: 'file_deleted',
      message: `${req.user.name} deleted "${attachment.originalName}"`,
    });

    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete file', error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Task activity
// ---------------------------------------------------------------------------

router.get('/tasks/:id/activity', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const activities = await Activity.find({
      entityType: 'task',
      entityId: req.params.id,
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch activity', error: error.message });
  }
});

module.exports = router;
