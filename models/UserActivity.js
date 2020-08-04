const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');

const UserActivity = database.define('UserActivity', {
    userActivityId: {
        field: 'user_activity_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    ipAddress: {
        field: 'ip_address',
        type: Sequelize.STRING,
        allowNull: false
    },
    userAgent: {
        field: 'user_agent',
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'User',
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    visitedAt: {
        field: 'visited_at',
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
    },
    visitedUrl: {
        field: 'visited_url',
        type: Sequelize.STRING,
        allowNull: false
    },
    requestMethod: {
        field: 'request_method',
        type: Sequelize.STRING,
        allowNull: false
    },
}, {
    tableName: 'user_activity'
});

module.exports = UserActivity;