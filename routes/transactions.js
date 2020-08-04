const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const User = require('../models/User');
const checkLogin = require('../middlewares/checkLogin');
const checkAccountOwner = require('../middlewares/checkAccountOwner');
const Transaction = require('../models/Transaction');
const getBalanceForAccount = require('../helpers/getBalanceForAccount');
const { check, validationResult } = require('express-validator');
const ExchangeRate = require('../models/ExchangeRate');
const checkForeignTransactionAccountsOwner = require('../middlewares/checkForeignTransactionAccountsOwner');
const getBalanceForForeignAccount = require('../helpers/getBalanceForForeignAccount');

router.get('/list', [ checkLogin, checkAccountOwner ], async (req, res) => {
    const account =  await Account.findOne({
        where: {
            accountNumber: req.query.accountNumber
        },
        include: [{
            model: Transaction,
            as: 'InboundTransactions',
            include: ['AccountSender', 'AccountReceiver']
        }, {
            model: Transaction,
            as: 'OutboundTransactions',
            include: ['AccountSender', 'AccountReceiver']
        },
        'Currency']
    });

    let accountBalance = 0;

    if(account.dataValues.Currency.dataValues.code === 'RSD') {
        accountBalance =  await getBalanceForAccount(account);
    }
    
    if(account.dataValues.Currency.dataValues.code === 'EUR') {
        accountBalance =  await getBalanceForForeignAccount(account);
    }

    res.render('transaction/list', {
        title: 'Pregled svih transakcija',
        accountNumber: req.query.accountNumber,
        balance: accountBalance,
        account: account
    });
});

router.get('/new', [ checkLogin, checkAccountOwner ], async (req, res) => {
    const account = await Account.findOne({
        include: [{
            model: User,
            as: 'User',
            include: 'City'
        }],
        where: {
            accountNumber: req.query.accountNumber            
        }        
    });

    res.render('transaction/newTransaction', {
        title: 'Nova uplata',
        accountNumber: req.query.accountNumber,
        owner: account.dataValues.User.dataValues,
        ownerCity: account.dataValues.User.dataValues.City.dataValues
    });
});

router.get('/foreign/new', checkLogin, async (req, res) => {
    const accounts = await Account.findAll({
        where: {
            userId: req.session.userId
        },
        include: 'Currency'
    });

    res.render('transaction/newForeignTransaction', {
        title: 'Menjačnica deviza',
        accounts: accounts
    });
});

router.post('/new', [ checkLogin, checkAccountOwner,
                      check('receiverAccountNumber', 'Broj racuna nije u ispravnom formatu!').matches(/^[0-9]{3}\-[0-9]{13}\-[0-9]{2}$/),
                      check('paymentPurpose', 'Polje za svrhu uplate ne sme biti prazno!').notEmpty().escape(),
                      check('amount', 'Polje za iznos ne sme biti prazno!').notEmpty()
], async (req, res) => {
    const { receiverAccountNumber, paymentPurpose, amount } = req.body;
    let errors = validationResult(req).errors;

    if(errors.length > 0) {
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    if(amount < 1.00) {
        errors.push({ msg: 'Iznos mora biti pozitivna vrednost' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    const accountReceiver = await Account.findOne({
        where: {
            accountNumber: receiverAccountNumber
        }
    });

    if(!accountReceiver) {
        errors.push({ msg: 'Nalog koji ste izabrali ne postoji!' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    const accountSender = await Account.findOne({
        where: {
            accountNumber: req.query.accountNumber
        }
    });

    if(!accountSender) {
        errors.push({ msg: 'Greska pri obradi naloga posiljaoca. Pokusajte ponovo' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    const balance = await getBalanceForAccount(accountSender);

    if(balance - amount < 0) {
        errors.push({ msg: 'Nemate dovoljno sredstava da biste izvrsili transakciju! Probajte sa drugim nalogom!' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }
    
    const newTransaction = await Transaction.create({
        amount: amount,
        fromAccountId: accountSender.dataValues.accountId,
        toAccountId: accountReceiver.dataValues.accountId,
        paymentPurpose: paymentPurpose
    });

    if(!newTransaction) {
        errors.push({ msg: 'Doslo je do greske prilikom obrade uplate!' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    req.session.successMessage = 'Uplata je uspesno izvrsena!';
    res.redirect('/account/list');
});

router.post('/foreign/new', [ checkLogin, checkForeignTransactionAccountsOwner, 
                              check('senderAccountNumber', 'Broj racuna nije u ispravnom formatu!').matches(/^[0-9]{2,3}\-[0-9]{13}\-[0-9]{2}$/),
                              check('receiverAccountNumber', 'Broj racuna nije u ispravnom formatu!').matches(/^[0-9]{2,3}\-[0-9]{13}\-[0-9]{2}$/),
                              check('amount', 'Polje za iznos ne sme biti prazno!').notEmpty()  
    
],async (req, res) => {
    const { senderAccountNumber, receiverAccountNumber } = req.body;
    let amount = req.body.amount;

    let errors = validationResult(req).errors;

    if(errors.length > 0) {
        req.session.errors = errors;
        return res.redirect('/account/list');
    }
    
    euroCurrencyCode = 'EUR';
    dinarCurrencyCode = 'RSD';

    
    const accountSender = await Account.findOne({
        where: {
            accountNumber: senderAccountNumber
        },
        include: 'Currency'
    });

    const accountReceiver = await Account.findOne({
        where: {
            accountNumber: receiverAccountNumber
        },
        include: 'Currency'
    });

    if(accountSender.dataValues.currencyId === accountReceiver.dataValues.currencyId) {
        errors.push({ msg: 'Razmena deviza zahteva naloge sa razlicitim valutama' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }
    
    const exchangeRateForToday = await ExchangeRate.findOne({
        where: {
            downloadedAt: new Date().toISOString().slice(0,10)
        }
    });

    if(!exchangeRateForToday) {
        errors.push({ msg: 'Razmena deviza trenutno ne moze da se izvrsi. Molimo Vas da pokusate ponovo kasnije.' });
        req.session.errors = errors;
        return res.redirect('/account/list');
    }

    let balance = 0;

    let transaction;
    let foreignPaymentPurpose = 'Kupovina deviza';

    // Ako se podizu devize sa racuna - prodaja deviza
    if(accountSender.dataValues.Currency.dataValues.code === euroCurrencyCode) {
        balance = await getBalanceForForeignAccount(accountSender);

        if(balance - amount < 1.0000) {
            errors.push({ msg: 'Iznos mora biti pozitivna vrednost' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }

        foreignPaymentPurpose = 'Prodaja deviza';
        
        amount = amount * exchangeRateForToday.dataValues.sellingRate;
        

        if(amount < 1.00) {
            errors.push({ msg: 'Iznos mora biti pozitivna vrednost' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }

        transaction = await Transaction.create({
            fromAccountId: accountSender.dataValues.accountId,
            toAccountId: accountReceiver.dataValues.accountId,
            paymentPurpose: foreignPaymentPurpose,
            amount: amount
        });

        if(!transaction) {
            errors.push({ msg: 'Doslo je do greske prilikom obrade zahteva. Pokusajte ponovo' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }
    }

    // Ako se salju devize na racun - kupovina deviza
    if(accountSender.dataValues.Currency.dataValues.code === dinarCurrencyCode) {
        balance = await getBalanceForAccount(accountSender);
        
        if (balance - amount < 0 ) {
            errors.push({ msg: 'Iznos mora biti pozitivna vrednost' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }


        if(amount < 1.00) {
            errors.push({ msg: 'Iznos mora biti pozitivna vrednost' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }
        
        transaction = await Transaction.create({
            fromAccountId: accountSender.dataValues.accountId,
            toAccountId: accountReceiver.dataValues.accountId,
            paymentPurpose: foreignPaymentPurpose,
            amount: amount
        });

        if(!transaction) {
            errors.push({ msg: 'Doslo je do greske prilikom obrade zahteva. Pokusajte ponovo' });
            req.session.errors = errors;
            return res.redirect('/account/list');
        }
    }

    req.session.successMessage = 'Devize uspesno razmenjene!';
    res.redirect('/account/list');    
});

module.exports = router;