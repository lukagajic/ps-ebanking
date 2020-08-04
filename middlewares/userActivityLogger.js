const UserActivity = require('../models/UserActivity');

module.exports = async (req, res, next) => {
    let route = req.path;

    if(route === '/auth/login' || route === '/auth/register' || route === '/auth/logout' || !req.session.userId) {
        next();
        return;
    } else {
        const activity = await UserActivity.create({
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            userId: req.session.userId,
            visitedUrl: route,
            requestMethod: req.method
        });

        if(activity) {
            next();
        }
    }
}