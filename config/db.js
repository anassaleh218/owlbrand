const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    host: "localhost",
    dialect: "mysql",
    username: "root",
    database: "owlbrand",
    logging : console.log ,
});

module.exports = sequelize;