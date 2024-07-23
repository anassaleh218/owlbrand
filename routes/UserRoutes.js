const { User } = require("../models/UserModelDB");
const { Cart } = require("../models/CartModelDB");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userValidator = require("../middleware/UserValidatorMW");

// Regestration
// user can't add value to isAdmin while registeration, make it manually for first admin then use admin route

/**
 * @swagger
 * /api/user/:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided details. If the user is not an admin, a cart is also created for the user. A JWT token is generated and returned in the response header.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User created successfully
 *         headers:
 *           x-auth-token:
 *             description: JWT token
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *                 userName:
 *                   type: string
 *               example:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 isAdmin: false
 *                 userName: "John Doe"
 *       400:
 *         description: User already exists or validation error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "User already exists"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Data of user not added"
 */

router.post("/", userValidator, async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    if (existingUser) return res.status(400).send("User already exists");

    // Hash the password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPswd = await bcrypt.hash(req.body.password, salt);

    // Create new user without isAdmin field
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPswd,
      isAdmin: false, // Ensure this is set to false
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
      token: token,
      isAdmin: user.isAdmin,
      userName: user.name
    };
    return res.status(200).send(data);

  } catch (err) {
    console.error('Error:', err.message);

    // Improved error handling
    let errorMessage = "Data of user not added";
    if (err.name === 'SequelizeValidationError') {
      errorMessage = err.errors.map(e => e.message).join(', ');
    } else if (err.name === 'SequelizeUniqueConstraintError') {
      errorMessage = 'User with this email already exists';
    }
  }
})
module.exports = router;