const database = require('../configuration/databaseConnection');
const Sequelize = require('sequelize');
const User = require('./User');

const City = database.define('City', {
    cityId: {
        field: 'city_id',
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    }
}, {
    tableName: 'city'
});

User.belongsTo(City, {
    foreignKey: 'city_id'
});

module.exports = City;