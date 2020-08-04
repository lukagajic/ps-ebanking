const dbConfig = require('../configuration/databaseConfiguration');
const sessionConfig = require('../configuration/session');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

module.exports = new MySQLStore({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    createDatabaseTable: false,
    expiration: sessionConfig.maxAge,
    schema: {
        tableName: 'user_session',
        columnNames: {
            session_id: 'sid',
            data: 'data',
            expires: 'expires'
        }
    }
});