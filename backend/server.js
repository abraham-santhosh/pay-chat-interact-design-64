const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔌 Replace with your actual MongoDB Atlas URI
const mongoURI = "mongodb+srv://abrahamsanthosh2005:manar0ckz@error404.61z6wbv.mongodb.net/Error404?retryWrites=true&w=majority&appName=error404";


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ DB error:', err));

// Define schema and model
const Message = mongoose.model('Message', {
  name: String,
  message: String,
  time: { type: Date, default: Date.now },
});

// POST: Save new message
app.post('/messages', async (req, res) => {
  const newMsg = new Message(req.body);
  await newMsg.save();
  res.send(newMsg);
});

// GET: Get all messages
app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.send(messages);
});

// Start server
app.listen(3001, () => console.log('🚀 Server running at http://localhost:3001'));

