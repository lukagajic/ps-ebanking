const express = require('express');
const router = express.Router();
const City = require('../models/City');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

// GET rute
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Prijava na sistem'
    });
    req.session.destroy();
});

router.get('/register', async (req, res) => {
    const cities = await City.findAll();
    const genders = User.rawAttributes.gender.values;

    res.render('auth/register', {
        title: 'Registracija',
        cities: cities,
        genders: genders
    });

    req.session.destroy();
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    return res.redirect('/auth/login');
});

// POST metode

router.post('/login',
[
    check('email', 'Email nije u ispravnom formatu!').isEmail().normalizeEmail(),
    check('password', 'Lozinka nije u ispravnom formatu!').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
], async (req, res) => {
    let errors = validationResult(req).errors;

    if(errors.length > 0) {
        req.session.errors = errors;
        return res.redirect('/auth/login');
    }

    const { email, password } = req.body;
    
    let foundUser = await User.findOne({
        where: {
            email: email
        }
    });

    if(!foundUser) {
        errors.push({ msg: 'Neispravna kombinacija email-a i lozinke. Probajte ponovo!' });
        req.session.errors = errors;
        return res.redirect('/auth/login');
    }

    let arePasswordsEqual = await bcrypt.compare(password, foundUser.dataValues.passwordHash);

    if(!arePasswordsEqual) {
        errors.push({ msg: 'Neispravna kombinacija email-a i lozinke. Probajte ponovo!' });
        req.session.errors = errors;
        return res.redirect('/auth/login');
    }
    
    req.session.userId = foundUser.dataValues.userId;
    res.redirect('/account/list');
});

// POST metoda za registraciju novog korisnika na sistem
router.post('/register', [
    check('email', 'Email nije u ispravnom formatu!').isEmail().normalizeEmail(),
    check('password', 'Lozinka nije u ispravnom formatu!').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
    check('password-confirm', 'Unete lozinke se ne poklapaju').custom((value, {req}) => (value === req.body.password)),
    check('forename', 'Polje za ime ne sme biti prazno!').notEmpty().escape(),
    check('surname', 'Polje za prezime ne sme biti prazno!').notEmpty().escape(),
    check('birthdate').notEmpty().withMessage('Polje za d ne sme biti prazno!').escape(),
    check('jmbg', 'JMBG mora imati 13 cifara!').matches(/^[0-9]{13}$/),
    check('address', 'Adresa mora da ima minimum 5 karaktera').notEmpty().isLength({min: 5}).escape(),
    check('postalCode', 'Poštanski broj mora da sadrži tačno 5 cifara!').matches(/^[0-9]{5}$/),
    check('city', 'Izabrali ste nepostojeći grad!').isInt()
],
 async (req, res) => {
    let errors = validationResult(req).errors;

    if(errors.length > 0) {
        req.session.errors = errors;
        return res.redirect('/auth/register');
    }

    /*  
        Proveriti da li postoji vec korisnik u bazi sa e-mailom iz body-ja
    */
   const foundUser = await User.findOne({
       where: {
           email: req.body.email
       }
   });

   if(foundUser) {
        errors.push({ msg: 'Korisnik sa zadatom E-mail adresom postoji u bazi!' });
        req.session.errors = errors;
        return res.redirect('/auth/register');
   }

    const newUser = await User.create({
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        forename: req.body.forename,
        surname: req.body.surname,
        dateOfBirth: req.body.birthdate,
        jmbg: req.body.jmbg,
        gender: req.body.gender,
        address: req.body.address,
        postalCode: req.body.postalCode,
        cityId: req.body.city 
    });

    if(!newUser) {
        errors.push({ msg: 'Došlo je do greške prilikom registracije korisnika!' });
        req.session.errors = errors;
        return res.redirect('/auth/register');
    }
    
    req.session.successMessage = 'Uspešno ste se registrovali na sistem!';
    res.redirect('/auth/login');
});

module.exports = router;