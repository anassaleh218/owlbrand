const userValidator = require("../middleware/UserValidatorMW");
const { User } = require("../models/UserModelDB");
const { Cart } = require("../models/CartModelDB");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Regestration
// user can't add value to isAdmin while registeration, make it manually for first admin then use admin route
router.post("/", userValidator, async (req, res) => {
  try {
    // check if already exist
    // Check user existence
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingUser) return res.status(400).send("User already exists");

    // add new user => hashing password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPswd = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({
      name: req.body.name,
      // username: req.body.username,
      email: req.body.email,
      password: hashedPswd,
      // phone: req.body.phone,
      // address: req.body.address,
      isAdmin: false
    });
    
    // Create a cart for non-admin users
    if (!user.isAdmin) {
      console.log('User is not an Admin');
      await Cart.create({ UserId: user.id });
    } else {
      console.log('User is an Admin');
    }

    // Generate token
    const token = jwt.sign(
      { userid: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "72h" }
    );

    // Send response with token
    res.header("x-auth-token", token);

    const data = {
      token: token, // Replace with your attribute and value
      isAdmin: user.isAdmin
    };
    return res.status(200).send(data);

  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("Data of user not added");
  }
});

module.exports = router;