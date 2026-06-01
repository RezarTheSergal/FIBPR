const express = require('express');
const mongoose = require('./database');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ status: 'healthy', db: 'connected' });
    } else {
        res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ id: req.params.id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3089;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
