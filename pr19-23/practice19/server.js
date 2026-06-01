const express = require('express');
const sequelize = require('./database');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    if (sequelize.authenticate) {
        res.status(200).json({ status: 'healthy', db: 'connected' });
    } else {
        res.status(503).json({ status: 'unhealthy', db: 'disconnected' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.destroy();
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3088;


sequelize.sync({ force: true }) 
    .then(() => {
        console.log('Database synced');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error syncing db: ', error);
    });
