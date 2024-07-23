const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { Product } = require("./ProductModelDB")
const { User } = require("./UserModelDB");

const Feedback = db.define("Feedback", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  rate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  feedback: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ProductId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product, // 'Actors' would also work
      key: 'id',
    },
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: {
        model: User, // 'Movies' would also work
        key: 'id',
    },
    allowNull: false
}},
{
    timestamps: true
});

// Assuming you have defined models for User and Feedback
User.hasMany(Feedback, { foreignKey: 'UserId' });
Feedback.belongsTo(User, { foreignKey: 'UserId' });

// Assuming you have defined models for User and Feedback
Product.hasMany(Feedback, { foreignKey: 'ProductId' });
Feedback.belongsTo(Product, { foreignKey: 'ProductId' });


module.exports = { Feedback }