const Transaction = require('../models/Transaction');
const ExchangeRate = require('../models/ExchangeRate');

module.exports = async (account) => {
    let inSum = 0;
    let outSum = 0;

    console.log(account.dataValues.accountId);
    let incomeTransactions = await Transaction.findAll({ where: { toAccountId: account.dataValues.accountId } });
    let outcomeTransactions = await Transaction.findAll({ where: { fromAccountId: account.dataValues.accountId } });

    for (let transaction of incomeTransactions) {
        transaction.dataValues.transferedAt = new Date(transaction.dataValues.transferedAt).toISOString().slice(0,10)
        const exchangeRate = await ExchangeRate.findOne({ where: { downloadedAt: transaction.dataValues.transferedAt } })

        inSum += transaction.dataValues.amount / exchangeRate.dataValues.buyingRate;
    }

    for (let transaction of outcomeTransactions) {
        transaction.dataValues.transferedAt = new Date(transaction.dataValues.transferedAt).toISOString().slice(0,10)
        const exchangeRate = await ExchangeRate.findOne({ where: { downloadedAt: transaction.dataValues.transferedAt } })
                                             
        outSum += transaction.dataValues.amount / exchangeRate.dataValues.sellingRate;
    }    

    return account.dataValues.initialAmount + inSum - outSum;
}