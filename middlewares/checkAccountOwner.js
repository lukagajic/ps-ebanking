const Account = require('../models/Account');

module.exports = async (req, res, next) => {
    let errors = [];

    const account = await Account.findOne({
        where: {
            accountNumber: req.query.accountNumber
        }
    });

    if(!account) {
        errors.push({ msg: 'Nalog sa zadatim brojem ne postoji!' });
        res.redirect('/account/list');
    }
    
    console.log(account.dataValues);

    if(account.dataValues.userId !== req.session.userId) {
        errors.push({ msg: 'Pristup ovom nalogu Vam nije dozvoljen! '});
        res.redirect('/account/list');
    }

    // Ako su sve provere prošle, nastavi lanac izvršavanja middleware-a
    next();
}