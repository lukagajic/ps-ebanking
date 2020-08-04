const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');

const Currency = database.define('Currency', {
    currencyId: {
        field: 'currency_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    country: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    }
}, {
    tableName: 'currency'
});

module.exports = Currency;