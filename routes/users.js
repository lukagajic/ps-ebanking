const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/checkLogin');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const City = require('../models/City');
const bcrypt = require('bcrypt');

router.get('/profile', checkLogin, async(req, res) => {
    const userId = req.session.userId;
    
    const currentUser = await User.findOne({
        where: {userId: userId},
        include: 'City'
    });

    res.render('user/profile',  {
        title: 'Podaci o korisniku',
        currentUser: currentUser.dataValues,
        cityName: currentUser.dataValues.City.dataValues.name
    });
});

router.get('/profile/edit', checkLogin, async(req, res) => {
    const userId = req.session.userId;
    
    const currentUser = await User.findOne({
        where: {userId: userId},
        include: 'City'
    });

    const cities = await City.findAll();
    const genders = User.rawAttributes.gender.values;

    req.session.save((err) => {
        if(err) throw err;
        res.render('user/editProfile', {
            title: 'Izmena profila',
            currentUser: currentUser.dataValues,
            cityName: currentUser.dataValues.City.dataValues.name,
            cities: cities,
            genders: genders
        });
    });

    delete req.session.errors;
});

router.get('/profile/edit/password', checkLogin, async(req, res) => {
    const userId = req.session.userId;
    
    const currentUser = await User.findOne({
        where: {userId: userId},
    });

    req.session.save((err) => {
        if(err) throw err;
        res.render('user/editPassword', {
            title: 'Izmena lozinke',
            currentUser: currentUser.dataValues
        });
    });
    delete req.session.errors;
});

// POST metode

router.post('/profile/edit', [
    check('email', 'Email nije u ispravnom formatu!').isEmail().normalizeEmail(),
    check('forename', 'Polje za ime ne sme biti prazno!').notEmpty().escape(),
    check('surname', 'Polje za prezime ne sme biti prazno!').notEmpty().escape(),
    check('birthdate').notEmpty().withMessage('Polje za d ne sme biti prazno!').escape(),
    check('jmbg', 'JMBG mora imati 13 cifara!').matches(/^[0-9]{13}$/),
    check('address', 'Adresa mora da ima minimum 5 karaktera').notEmpty().isLength({min: 5}).escape(),
    check('postalCode', 'Poštanski broj mora da sadrži tačno 5 cifara!').matches(/^[0-9]{5}$/),
    check('city', 'Izabrali ste nepostojeći grad!').isInt()
], async (req, res) => {
    const userId = req.session.userId;
    let errors = validationResult(req);

    if(errors.length > 0) {
        req.session.errors = errors;
        console.log(errors);
        return res.redirect('/user/profile/edit');
    }

    const updatedUser = await User.update({
        email: req.body.email,
        forename: req.body.forename,
        surname: req.body.surname,
        dateOfBirth: req.body.birthdate,
        jmbg: req.body.jmbg,
        gender: req.body.gender,
        address: req.body.address,
        postalCode: req.body.postalCode,
        cityId: req.body.city
    }, {
        where: {userId: userId}
    });

    res.redirect('/user/profile');
});

router.post('/profile/edit/password', [
    check('newPassword', 'Lozinka nije u ispravnom formatu!').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    check('newPasswordConfirm', 'Unete lozinke se ne poklapaju').custom((value, {req}) => (value === req.body.newPassword))
], async (req, res) => {
   let errors = validationResult(req).errors;

   if(errors.length > 0) {
       req.session.errors = errors;
       console.log(errors);
       return res.redirect('/user/profile/edit/password');
   }

    const currentUser = await User.findOne({
        where: {
            userId: req.session.userId
        }
    });

    const { oldPassword, newPassword } = req.body;

    let arePasswordsEqual = await bcrypt.compare(oldPassword, currentUser.dataValues.passwordHash);

    if(!arePasswordsEqual) {
        errors.push({ msg: 'Uneta stara lozinka nije ispravna!' });
        req.session.errors = errors;
        return res.redirect('/user/profile/edit/password');
    }

    const updatedUser = await User.update({
        passwordHash: bcrypt.hashSync(newPassword, 10)
    }, {
        where: {userId: req.session.userId}
    });

    res.redirect('/user/profile');
});

module.exports = router;