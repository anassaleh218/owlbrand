const { DataTypes } = require("sequelize");
const db = require("../config/db");

const { User } = require("./UserModelDB");
const { Product } = require("./ProductModelDB")

const FavProducts = db.define('FavProducts', {
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // 'Movies' would also work
      key: 'id',
    },
    allowNull: false
  },
  ProductId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product, // 'Actors' would also work
      key: 'id',
    },
  }
},
  {
    timestamps: false
  });

const WatchList = db.define('WatchList', {
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User, // 'Movies' would also work
      key: 'id',
    },
    allowNull: false
  },
  ProductId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product, // 'Actors' would also work
      key: 'id',
    },
  }
},
  {
    timestamps: false
  });


User.hasMany(FavProducts, { foreignKey: 'UserId' });
FavProducts.belongsTo(User, { foreignKey: 'UserId' });

Product.hasMany(FavProducts, { foreignKey: 'ProductId' });
FavProducts.belongsTo(Product, { foreignKey: 'ProductId' });

User.hasMany(WatchList, { foreignKey: 'UserId' });
WatchList.belongsTo(User, { foreignKey: 'UserId' });

Product.hasMany(WatchList, { foreignKey: 'ProductId' });
WatchList.belongsTo(Product, { foreignKey: 'ProductId' });

module.exports = { FavProducts, WatchList };