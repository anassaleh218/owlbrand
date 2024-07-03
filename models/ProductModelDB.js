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
    values: ["T-Shirts", "Hoodies", "Bags"],
    allowNull: false
  },
  // type: {
  //   type: DataTypes.ENUM,
  //   values: ["Regular", "Oversize"],
  //   allowNull: false
  // },
  // size: {
  //   type: DataTypes.ENUM,
  //   values: ["none", "S", "M", "L", "XL", "XXL", "XXXL"],
  //   allowNull: false
  // },
  // color: {
  //   type: DataTypes.ENUM,
  //   values: ["Black", "White", "Red", "Blue", "Green"],
  //   allowNull: false
  // },
  // quantity: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false
  // },
  show:{
    type:DataTypes.BOOLEAN,
    defaultValue:1
  }
},
{
    timestamps: false
});

const Type = db.define('Type', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
    timestamps: false
});

const Size = db.define('Size', {
  size: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
    timestamps: false
});

const Color = db.define('Color', {
  color: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
    timestamps: false
});

Product.hasMany(Type, { as: 'types', foreignKey: 'productId' });
Type.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Size, { as: 'sizes', foreignKey: 'productId' });
Size.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Color, { as: 'colors', foreignKey: 'productId' });
Color.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

db.sync().then(() => {
  console.log("Models synchronized successfully");
});

module.exports = { Product, Type, Size, Color };
