const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || 'unknown-server';

app.get('/', (req, res) => {
    console.log(`Received request on ${SERVER_NAME} (Port: ${PORT})`);
    res.json({
        message: 'Response from backend server',
        server: SERVER_NAME,
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ${SERVER_NAME} started on port ${PORT}`);
});
