const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');
const Currency = require('./Currency');
const User = require('./User');

const Account = database.define('Account', {
    accountId: {
        field: 'account_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    accountNumber: {
        field: 'account_number',
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    userId: {
        field: 'user_id',
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
            model: 'User',
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    currencyId: {
        field: 'currency_id',
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
            model: 'Currency',
            key: 'currency_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    initialAmount: {
        field: 'initial_amount',
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'account'
});

Account.belongsTo(Currency, {
    foreignKey: 'currency_id'
});



module.exports = Account;