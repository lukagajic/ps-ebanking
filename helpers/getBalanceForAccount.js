const Transaction = require('../models/Transaction');

module.exports = async (account) => {
    console.log(account.dataValues.accountId);
    let income = await Transaction.sum('amount', { where: { toAccountId: account.dataValues.accountId } });
    let outcome = await Transaction.sum('amount', { where: { fromAccountId: account.dataValues.accountId } });

    return account.dataValues.initialAmount + income - outcome;
}