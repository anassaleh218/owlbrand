const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { Cart } = require("./CartModelDB")
const { Product } = require("./ProductModelDB")

const CartProducts = db.define('CartProducts', {
  CartId: {
    type: DataTypes.INTEGER,
    references: {
      model: Cart, // 'Movies' would also work
      key: 'id',
    },
  },
  ProductId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product, // 'Actors' would also work
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},
  {
    timestamps: false
  });

  Product.belongsToMany(Cart, { through: CartProducts, foreignKey: 'ProductId' });
  Cart.belongsToMany(Product, { through: CartProducts, foreignKey: 'CartId' });
  
  CartProducts.belongsTo(Product, { foreignKey: 'ProductId' }); // Ensure this association is defined
  CartProducts.belongsTo(Cart, { foreignKey: 'CartId' }); // Ensure this association is defined
  

module.exports = { CartProducts }