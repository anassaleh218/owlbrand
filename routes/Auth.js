const Validator = require("../middleware/AuthValidatorMW");
const {User} = require("../models/UserModelDB");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Logging in (Authentication)
router.post("/", Validator, async (req, res) => {
  try {
    // check if already exist
    let user = await User.findOne({
      where: { email: req.body.email },
    });
    if (!user) return res.status(400).send("email or password incorrect");

    // checking password
    const isValidPswd = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPswd)
      return res.status(400).send("email or password incorrect");

    // const token = user.genAuthToken();
    const token = jwt.sign({ userid: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "72h" });

    // password correct
    res.header("x-auth-token", token);
    const data = {
      token: token ,// Replace with your attribute and value
      isAdmin: user.isAdmin
    };
    res.status(200).send(data);
    // res.status(200).send("Logged in Successfully");

  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error while logging in");
  }

});

module.exports = router;
