module.exports = (req, res, next) => {
    let errors = [];

    let dayOfTheWeek = new Date().getDay();

    if(dayOfTheWeek === 0 || dayOfTheWeek === 6) {
        errors.push({ msg: 'Strane transakcije se ne mogu obavljati vikendom!' });
        res.redirect('/account/list');
    }

    next();
}