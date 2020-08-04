const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');

const ExchangeRate = database.define('ExchangeRate', {
    exchangeRateId: {
        field: 'exchange_rate_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    sellingRate: {
        field: 'selling_rate',
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    buyingRate: {
        field: 'buying_rate',
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    middleRate: {
        field: 'middle_rate',
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
    downloadedAt: {
        field: 'downloaded_at',
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
    }    
}, {
    tableName: 'exchange_rate'
});

module.exports = ExchangeRate;