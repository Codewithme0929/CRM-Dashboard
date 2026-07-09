// server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();
const Notification = require("./models/Notification");
const Client = require('./models/Client');
const Task = require('./models/Task');
const { protect } = require('./middleware/authMiddleware');
const connectDatabase = require('./config/database');
const detailRoutes = require('./routes/detailRoutes');
const { logActivity } = require('./utils/activity');
const app = express();

app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', detailRoutes);

connectDatabase();


// =========================================================================
// 🏢 CLIENT CRUD ROUTES
// =========================================================================

// 👉 [READ] GET ALL CLIENTS 
// Fetches all clients from the database and sorts them by newest first
// GET ALL CLIENTS WITH PAGINATION
app.get('/api/clients', async (req, res) => {
  try {
    // 1. Convert incoming URL query strings to real numbers
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
  

    // 2. Calculate how many documents to skip over
    const skip = (page - 1) * limit;
const filter = {};

if (search) {
  filter.name = {
    $regex: search,
    $options: "i"
  };
}
    // 3. Grab the total count so the frontend knows how many pages exist
    const totalClients = await Client.countDocuments(filter);

    // 4. Query only the specific slice of data for this page
    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // 5. Return the structured object back to Axios
    res.json({
      clients,
      currentPage: page,
      totalPages: Math.ceil(totalClients / limit),
      totalClients
    });

  } catch (error) {
    console.error(" PAGINATION SERVER ERROR:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Validates data incoming from form and saves a new client record to MongoDB
app.post("/api/clients", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    await logActivity({
      entityType: 'client',
      entityId: savedClient._id,
      action: 'created',
      message: `Client "${savedClient.name}" was created`,
    });
    res.status(201).json(savedClient);
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error.message);
    res.status(400).json({
      message: "Invalid Data",
      error: error.message
    });
  }
});

// Fetches a single client's deep profile data to auto-fill the React Edit Form
app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id); 
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error });
  }
});

// 👉 [UPDATE] EDIT CLIENT BY ID
// Targets an existing client document by its URL parameter ID and applies form changes
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, email, phone, status, company, industry, companySize, website, address, notes } = req.body;
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, company, industry, companySize, website, address, notes },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    await logActivity({
      entityType: 'client',
      entityId: updatedClient._id,
      action: 'updated',
      message: `Client "${updatedClient.name}" was updated`,
    });

    res.json(updatedClient);
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error.message);
    res.status(400).json({ message: "Error updating client", error: error.message });
  }
});

// 👉 [DELETE] REMOVE CLIENT BY ID
// Permanently destroys a client document from MongoDB and confirms deletion to the UI modal
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found or already deleted." });
    }

    await logActivity({
      entityType: 'client',
      entityId: deletedClient._id,
      action: 'deleted',
      message: `Client "${deletedClient.name}" was deleted`,
    });
    
    res.json({ message: "Client deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ message: "Server error while deleting client", error: error.message });
  }
});


// =========================================================================
// 🔐 AUTHENTICATION ROUTES & HELPERS
// =========================================================================

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// REGISTER NEW USER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// LOGIN EXISTING USER
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// =========================================================================
// 👤 USER PROFILE / SETTINGS ROUTES
// =========================================================================

app.get('/api/users/profile', protect, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role || 'Admin',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
});

app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailTaken = await User.findOne({
      email: email.trim(),
      _id: { $ne: req.user._id },
    });

    if (emailTaken) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), email: email.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || 'Admin',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update profile', error: error.message });
  }
});

app.put('/api/users/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update password', error: error.message });
  }
});


// =========================================================================
// 🚀 SERVER INIT (moved to end of file)
// =========================================================================

//==============Task=========================//

app.get('/api/tasks', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const clientId = req.query.client || "";

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (clientId) {
      filter.client = clientId;
    }
    const totalTasks = await Task.countDocuments(filter);

   
     const tasks = await Task.find(filter)
       .populate('client', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(totalTasks / limit),
      totalTasks
    });

  } catch (error) {
    console.error("TASK PAGINATION ERROR:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { name, description, client, assignee, priority, status, dueDate, subtasks } = req.body;

    const newTask = new Task({
      name,
      description,
      client: client || undefined,
      assignee,
      priority,
      status,
      dueDate: dueDate || undefined,
      subtasks: Array.isArray(subtasks) ? subtasks : [],
    });

    const savedTask = await newTask.save();
    await logActivity({
      entityType: 'task',
      entityId: savedTask._id,
      action: 'created',
      message: `Task "${savedTask.name}" was created`,
    });
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("CREATE TASK ERROR:", error.message);
    res.status(400).json({
      message: "Invalid Data",
      error: error.message
    });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('client');

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching task",
      error
    });
  }
});


app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { name, description, client, assignee, priority, status, dueDate, subtasks } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        client: client || undefined,
        assignee,
        priority,
        status,
        dueDate: dueDate || undefined,
        ...(Array.isArray(subtasks) ? { subtasks } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    await logActivity({
      entityType: 'task',
      entityId: updatedTask._id,
      action: 'updated',
      message: `Task "${updatedTask.name}" was updated`,
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error.message);
    res.status(400).json({
      message: "Error updating task",
      error: error.message
    });
  }
});

app.patch('/api/tasks/:id/subtasks/:subtaskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);

    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.done = req.body.done !== undefined ? Boolean(req.body.done) : !subtask.done;
    await task.save();

    await logActivity({
      entityType: 'task',
      entityId: task._id,
      action: 'subtask_updated',
      message: `Subtask "${subtask.label}" marked as ${subtask.done ? 'done' : 'pending'}`,
    });

    res.json(task);
  } catch (error) {
    console.error('SUBTASK UPDATE ERROR:', error.message);
    res.status(500).json({ message: 'Unable to update subtask', error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found or already deleted."
      });
    }

    await logActivity({
      entityType: 'task',
      entityId: deletedTask._id,
      action: 'deleted',
      message: `Task "${deletedTask.name}" was deleted`,
    });

    res.json({
      message: "Task deleted successfully",
      id: req.params.id
    });

  } catch (error) {
    console.error("DELETE ERROR:", error.message);

    res.status(500).json({
      message: "Server error while deleting task",
      error: error.message
    });
  }
});
app.get("/api/dashboard", async (req, res) => {

  try {
    const totalClients = await Client.countDocuments();

    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({
      status: "Completed"
    });

    const pendingTasks = await Task.countDocuments({
      status: "Pending"
    });

    const inProgressTasks = await Task.countDocuments({
      status: "In Progress"
    });

    const startOfWeek = new Date();

    const day = startOfWeek.getDay() || 7;

    startOfWeek.setDate(startOfWeek.getDate() - day + 1);

    startOfWeek.setHours(0, 0, 0, 0);

    const tasksThisWeek = await Task.find({
      createdAt: {
        $gte: startOfWeek
      }
    });

    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun"
    ];

    const chartData = days.map(day => ({
      day,
      completed: 0,
      pending: 0
    }));

    tasksThisWeek.forEach(task => {

      const dayIndex = (new Date(task.createdAt).getDay() + 6) % 7;

      if (task.status === "Completed") {

        chartData[dayIndex].completed++;

      } else {

        chartData[dayIndex].pending++;

      }

    });

    const recentTasks = await Task.find()
      .populate("client", "name")
      .sort({ createdAt: -1 })
      .limit(5);


    const recentActivity = recentTasks.map(task => ({

      id: task._id,

      text: `${task.name} created for ${task.client?.name || "No Client"}`,

      status: task.status,

      time: task.createdAt

    }));
    res.json({

      totalClients,

      totalTasks,

      completedTasks,

      pendingTasks,

      inProgressTasks,

      chartData,

      recentActivity
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({

      message: "Dashboard Error",

      error: error.message

    });

  }

});

app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    // Don't search if the input is empty
    if (!q) {
      return res.json({
        clients: [],
        tasks: []
      });
    }

    // Search Clients
    const clients = await Client.find({
      name: {
        $regex: q,
        $options: "i"
      }
    })
      .select("_id name email company")
      .limit(5);

    // Search Tasks
    const tasks = await Task.find({
      $or: [
        {
          name: {
            $regex: q,
            $options: "i"
          }
        },
        {
          assignee: {
            $regex: q,
            $options: "i"
          }
        },
        {
          description: {
            $regex: q,
            $options: "i"
          }
        }
      ]
    })
      .populate("client", "name")
      .select("_id name status assignee client")
      .limit(5);

    res.status(200).json({
      success: true,
      query: q,
      clients,
      tasks
    });

  } catch (err) {
    console.error("Global Search Error:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong while searching."
    });
  }
});
app.get("/api/notifications", protect, async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [total, notifications] = await Promise.all([
          Notification.countDocuments({ user: req.user._id }),
          Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ]);

        res.json({
          notifications,
          page,
          totalPages: Math.ceil(total / limit) || 1,
          total,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Unable to fetch notifications"
        });

    }
}); 

// Create a new notification
app.post("/api/notifications", protect, async (req, res) => {
  try {
    const { title, message, type } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    const notification = await Notification.create({
      user: req.user._id,
      title,
      message,
      type: type || "info",
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create notification" });
  }
});

// Mark notification read/unread
app.patch("/api/notifications/:id", protect, async (req, res) => {
  try {
    const { isRead } = req.body || {};

    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: Boolean(isRead) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to update notification" });
  }
});

// Clear all notifications
app.delete("/api/notifications", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ message: "Notifications cleared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to clear notifications" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});