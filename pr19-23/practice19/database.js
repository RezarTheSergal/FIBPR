const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydatabase', 'postgres', 'password', {
    host: 'postgres',
    dialect: 'postgres',
    logging: false, 
});

module.exports = sequelize;
