const { DataTypes } = require("sequelize");
const db = require("../config/db");


const Cart = db.define("Cart", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
},
{
    timestamps: false 
});
module.exports = { Cart };