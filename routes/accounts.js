const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const { check, validationResult } = require('express-validator');
const Currency = require('../models/Currency');
const User = require('../models/User');
const createAccountRandomNumber = require('../helpers/createAccountRandomNumber');
const Account = require('../models/Account');
const getBalanceForAccount = require('../helpers/getBalanceForAccount');
const getBalanceForForeignAccount = require('../helpers/getBalanceForForeignAccount');

// GET rute
router.get('/list', checkLogin, async (req, res) => {
    const user = await User.findOne({
        include: [{
            model: Account,
            as: 'Accounts',
            include: 'Currency'
        }],
        where: {
            userId: req.session.userId
        }
    });

    for (account of user.dataValues.Accounts) {
        if (account.dataValues.Currency.dataValues.code === 'RSD') {
            account.balance = await getBalanceForAccount(account);
        }
        if (account.dataValues.Currency.dataValues.code === 'EUR') {
            account.balance = await getBalanceForForeignAccount(account);
        }
    }

    req.session.save((err) => {
        if (err) throw err;
        res.render('account/list', {
            title: 'Pregled računa',
            user: user.dataValues
        });
    });

    delete req.session.errors;
    delete req.session.successMessage;
});

router.get('/create', checkLogin, async(req, res) => {
    const currencies = await Currency.findAll();
    const userId = req.session.userId;

    res.render('account/createAccount', {
        title: 'Kreiranje novog računa',
        currencies: currencies
    });
});

// POST rute
router.post('/create', checkLogin, async (req, res) => {
    const { currency } = req.body;
    const currencies = await Currency.findAll();

    const selectedCurrency = currencies.find(curr => curr.dataValues.currencyId == currency);

    const selectedCurrencyCode = selectedCurrency.dataValues.code;
    
    // Osnovni broj za podrazumevani slucaj da je valuta u dinarima
    let baseNumber = '254-';

    if (selectedCurrencyCode === 'EUR') {
        baseNumber = '95-';
    }
    
    let generatedAccountNumber = baseNumber + createAccountRandomNumber();
    
    const newAccount = await Account.create({
        accountNumber: generatedAccountNumber,
        userId: req.session.userId,
        currencyId: selectedCurrency.dataValues.currencyId
    });

    res.redirect('/account/list');
});

module.exports = router;