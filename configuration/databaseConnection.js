const Sequelize = require('sequelize');
const dbConfig = require('./databaseConfiguration');

module.exports = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    define: {
        timestamps: false
    }
});
