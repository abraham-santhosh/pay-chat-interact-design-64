const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import models
const Message = require('./models/Message');
const User = require('./models/User');
const Group = require('./models/Group');
const Expense = require('./models/Expense');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI
const mongoURI = "mongodb+srv://abrahamsanthosh2005:manar0ckz@error404.61z6wbv.mongodb.net/Error404?retryWrites=true&w=majority&appName=error404";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB error:', err));

// MESSAGE ROUTES
app.post('/messages', async (req, res) => {
  try {
    const newMsg = new Message(req.body);
    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ time: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER ROUTES
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ name, email, password });
    await user.save();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:userId/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GROUP ROUTES
app.get('/api/groups', async (req, res) => {
  try {
    const { userId } = req.query;
    const groups = await Group.find({ createdBy: userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, description, notificationEmails, createdBy } = req.body;
    
    const group = new Group({
      name,
      description,
      notificationEmails: notificationEmails || [],
      createdBy,
      members: []
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const updates = req.body;
    
    const group = await Group.findByIdAndUpdate(groupId, updates, { new: true });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/groups/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username } = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (!group.members.includes(username)) {
      group.members.push(username);
      await group.save();
    }
    
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/groups/:groupId/members/:username', async (req, res) => {
  try {
    const { groupId, username } = req.params;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    group.members = group.members.filter(member => member !== username);
    await group.save();
    
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Delete all expenses in this group
    await Expense.deleteMany({ groupId });
    
    // Delete the group
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// EXPENSE ROUTES
app.get('/api/expenses', async (req, res) => {
  try {
    const { userId, groupId } = req.query;
    
    let query = { createdBy: userId };
    if (groupId) {
      query.groupId = groupId;
    }
    
    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { description, amount, paidBy, participants, date, createdBy, groupId } = req.body;
    
    const expense = new Expense({
      description,
      amount,
      paidBy,
      participants,
      date,
      createdBy,
      groupId
    });
    
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const updates = req.body;
    
    const expense = await Expense.findByIdAndUpdate(expenseId, updates, { new: true });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    
    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));