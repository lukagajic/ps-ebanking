const express = require('express');
const path = require('path');
const authRouter = require('./routes/auth');
const database = require('./configuration/databaseConnection');
const bodyParser = require('body-parser');
const sessionConfig = require('./configuration/session');
const checkLogin = require('./middlewares/checkLogin');
const usersRouter = require('./routes/users');

const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const userActivityLogger = require('./middlewares/userActivityLogger');
const https = require('https');
const fs = require('fs');
const cron = require('node-cron');
const insertExchangeRatesIntoDatabase = require('./helpers/insertExchangeRatesIntoDatabase');
const sessionStore = require('./configuration/sessionStore');
const session = require('express-session');

const SERVER_PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

database.authenticate().then(() => {
    console.log('Povezivanje na bazu uspešno!');
}).catch(e => {
    console.log(`Doslo je do greske: ${e}`);
});

cron.schedule('5 0 * * *', insertExchangeRatesIntoDatabase);

app.use(session({
    store: sessionStore,
    name: sessionConfig.name,
    resave: sessionConfig.resave,
    secure: sessionConfig.secure,
    saveUninitialized: sessionConfig.saveUninitialized,
    secret: sessionConfig.secret,
    cookie: {
        maxAge: sessionConfig.maxAge,
        sameSite: sessionConfig.sameSite,
        secure: sessionConfig.secure
    }
}));


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    res.locals.errors = req.session.errors;
    res.locals.successMessage = req.session.successMessage;
    next();
});

app.use(userActivityLogger);

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'FRAZA'
}, app)
.listen(SERVER_PORT);

app.get('/', checkLogin, (req, res) => {
    res.redirect('/user/profile');
});

app.use('/auth', authRouter);
app.use('/user', usersRouter);
app.use('/account', accountsRouter);
app.use('/transaction', transactionsRouter);

app.all('*', (req, res) => {
    res.redirect('/');
});

module.exports = app;