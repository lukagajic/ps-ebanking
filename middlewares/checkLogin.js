module.exports = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect('/auth/login');
    } else {
        next();
    }
}