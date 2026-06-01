const mongoose = require('mongoose');

const uri = 'mongodb://YourMongoAdmin:1234@mongo:27017/admin?authSource=admin';

const connectWithRetry = () => {
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: true,
        w: 'majority'
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

module.exports = mongoose;
