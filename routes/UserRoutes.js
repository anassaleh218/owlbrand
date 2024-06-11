const userValidator = require("../middleware/UserValidatorMW");
const User = require("../models/UserModelDB");
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

    // const token = user.genAuthToken();
    const token = jwt.sign(
      { userid: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "72h" }
    );

    // Added Successfully
    res.header("x-auth-token", token);

    const data = {
      token: token, // Replace with your attribute and value
      isAdmin: user.isAdmin
    };
    res.status(200).send(data);


    // res.status(200).send("user Added Successfully");
  } catch (err) {
    for (let i in err.errors) {
      console.log(err.errors[i].message);
    }
    res.status(400).send("data of user not added");
  }
});

module.exports = router;
