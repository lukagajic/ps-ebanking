const Account = require('../models/Account');

module.exports = async (req, res, next) => {
    let errors = [];

    const accountSender = await Account.findOne({
        where: {
            accountNumber: req.body.senderAccountNumber
        }
    });
    
    const accountReceiver = await Account.findOne({
        where: {
            accountNumber: req.body.receiverAccountNumber
        }
    });

    if(!accountSender || !accountReceiver) {
        errors.push({ msg: 'Nalog sa zadatim brojem ne postoji!' });
        res.redirect('/account/list');
    }

    if((accountSender.dataValues.userId !== req.session.userId) || (accountReceiver.dataValues.userId !== req.session.userId)) {
        errors.push({ msg: 'Pristup ovom nalogu Vam nije dozvoljen! '});
        res.redirect('/account/list');
    }

    // Ako su sve provere prošle, nastavi lanac izvršavanja middleware-a
    next();
}