const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Product = db.define("Product", {
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
    values: ["Electronics", "Mobiles", "Clothes", "Books", "Home","Grocery","Health"],
    allowNull: false
  },
  show:{
    type:DataTypes.BOOLEAN,
    defaultValue:1
  }
},
{
    timestamps: false
});



module.exports = { Product };
