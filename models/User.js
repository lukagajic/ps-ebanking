const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');
const Account = require('./Account');

const User = database.define('User', {
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        field: 'password_hash',
        type: Sequelize.STRING,
        allowNull: false
    },
    forename: {
        type: Sequelize.STRING(128),
        allowNull: false
    },
    surname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dateOfBirth: {
        field: 'born_at',
        type: Sequelize.DATE,
        allowNull: false
    },
    jmbg: {
        type: Sequelize.STRING(13),
        allowNull: false,
        unique: true
    },
    gender: {
        type: Sequelize.ENUM,
        values: ['male', 'female'],
        allowNull: false
    },
    address: {
        type: Sequelize.STRING(255)
    },
    /* createdAt: {
        field: 'created_at',
        type: Sequelize.TIMESTAMP,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    }, */
    postalCode: {
        field: 'postal_code',
        type: Sequelize.INTEGER.UNSIGNED,
    },
    cityId: {
        field: 'city_id',
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
            model: 'City',
            key: 'city_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    } 
}, {
    tableName: 'user'
});


Account.belongsTo(User, {
    foreignKey: 'user_id'
});

User.hasMany(Account, {
    foreignKey: 'user_id'
})

module.exports = User;