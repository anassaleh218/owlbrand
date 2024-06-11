const { DataTypes } = require("sequelize");
const db = require("../config/db");

module.exports = db.define("User", {
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
  // username: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   minlength: 5,
  //   unique: {
  //     args: true,
  //     msg: "Email must be unique"
  //   }
  // },
  email: {
    type: DataTypes.STRING,
    unique: {
      args: true,
      msg: "Email must be unique"
    },
    validate: {
      isEmail: {
        args: true,
        msg: "Invalid email format"
      },
      notEmpty: {
        args: true,
        msg: 'Cannot be blank'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    minlength: 5,
  },
  // phone: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  // address: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// // problem: not sign _id
// // userSchema.method("genAuthToken",()=>{
// //   const token = jwt.sign({ userid: this._id }, process.env.JWT_SECRET, {expiresIn: "72h"});
// //   return token;
// // })

// // create Model
// const User = mongoose.model("Users", userSchema);

// module.exports = { User };
