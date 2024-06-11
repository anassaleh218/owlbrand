const { DataTypes } = require("sequelize");
const db = require("../config/db");

module.exports = db.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  img_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM,
    values: ["T-Shirts", "Hoodies", "Bags"],
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM,
    values: ["Regular", "Oversize"],
    allowNull: false
  },
  size: {
    type: DataTypes.ENUM,
    values: ["none", "S", "M", "L", "XL", "XXL", "XXXL"],
    allowNull: false
  },
  color: {
    type: DataTypes.ENUM,
    values: ["Black", "White", "Red", "Blue", "Green"],
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
});
