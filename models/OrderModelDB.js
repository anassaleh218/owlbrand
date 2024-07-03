const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { User } = require("./UserModelDB");

const Order = db.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    order_status: {
        type: DataTypes.ENUM,
        values: ["Shipped", "Waiting for Confirmation"],
        allowNull: false
    }
});

User.hasMany(Order, { as: 'orders', foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });


module.exports = { Order }