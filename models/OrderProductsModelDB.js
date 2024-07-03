const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { Order } = require("./OrderModelDB")
const { Product } = require("./ProductModelDB")

const OrderProducts = db.define('OrderProducts', {
    OrderId: {
        type: DataTypes.INTEGER,
        references: {
            model: Order, // 'Movies' would also work
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

Order.belongsToMany(Product, { through: OrderProducts, foreignKey: 'OrderId', as: 'products' });
Product.belongsToMany(Order, { through: OrderProducts, foreignKey: 'ProductId', as: 'orders' });

Order.hasMany(OrderProducts, { foreignKey: 'OrderId', as: 'orderProducts' });

OrderProducts.belongsTo(Product, { foreignKey: 'ProductId', as: 'Product' });
OrderProducts.belongsTo(Order, { foreignKey: 'OrderId', as: 'order' });

module.exports = { OrderProducts }