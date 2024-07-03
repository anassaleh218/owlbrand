const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { Order } = require("./OrderModelDB");
const { User } = require("./UserModelDB");

const OrderBilling = db.define('OrderBilling', {
    OrderId: {
        type: DataTypes.INTEGER,
        references: {
            model: Order, // 'Movies' would also work
            key: 'id',
        },
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        references: {
            model: User, // 'Movies' would also work
            key: 'id',
        },
        allowNull: false
    },
    phone1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone2: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    flatNo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    floorNo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    buildingNo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalCost: {
        type: DataTypes.FLOAT,
        allowNull: false
    }

},
    {
        timestamps: true
    });

    OrderBilling.belongsTo(Order, { foreignKey: 'OrderId', as: 'order' });
    OrderBilling.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
    
module.exports = { OrderBilling }