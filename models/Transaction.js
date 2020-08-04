const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');
const Account = require('./Account');

// FALI TIMESTAMP, videti kako treba da se unese u model!!!
const Transaction = database.define('Transaction', {
    transactionId: {
        field: 'transaction_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    fromAccountId: {
        field: 'from__account_id',
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
            model: 'Account',
            key: 'account_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    toAccountId: {
        field: 'to__account_id',
        type: Sequelize.INTEGER.UNSIGNED,
        references: {
            model: 'Account',
            key: 'account_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    paymentPurpose: {
        field: 'payment_purpose',
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    transferedAt: {
        field: 'transfered_at',
        type: Sequelize.DATE,
        allowNull: true,
        unique: false
    }
}, {
    tableName: 'transaction'
});

Transaction.belongsTo(Account, {
    as: 'AccountSender',
    foreignKey: 'from__account_id'
});

Transaction.belongsTo(Account, {
    as: 'AccountReceiver',
    foreignKey: 'to__account_id'
});

Account.hasMany(Transaction, {
    foreignKey: 'from__account_id',
    as: 'OutboundTransactions'
});

Account.hasMany(Transaction, {
    foreignKey: 'to__account_id',
    as: 'InboundTransactions'
});

/* Account.hasMany(Transaction, {
    foreignKey: 'from__account_id'
});

Account.hasMany(Transaction, {
    foreignKey: 'to__account_id'
}); */

module.exports = Transaction;