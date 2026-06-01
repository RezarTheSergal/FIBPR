const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        get() {
            const rawValue = this.getDataValue('created_at');
            return rawValue ? Math.floor(rawValue.getTime() / 1000) : null;
        }
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        get() {
            const rawValue = this.getDataValue('updated_at');
            return rawValue ? Math.floor(rawValue.getTime() / 1000) : null;
        }
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;
