// const sequelize = require("../config/db");
const { Product } = require("../models/ProductModelDB");
const { Cart } = require("../models/CartModelDB");
const { CartProducts } = require("../models/CartProductsModelDB");

const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');

const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add a product to the cart
 *     description: Authenticated users can add a product to their cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: The ID of the product to add to the cart.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the product to add to the cart.
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       '200':
 *         description: Product successfully added to the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "products added to your cart successfully"
 *       '400':
 *         description: Failed to add product to the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "products NOT added to your cart"
 *       '404':
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
router.post("/", async (req, res) => {

    const token = req.header("x-auth-token");
    // if(!token) return res.status(401).send("Access Denied");
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userid = decodedPayload.userid;

        const cart = await Cart.findOne({
            where: {
                UserId: userid
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        // console.log(cart.id);
        // console.log(cart);
        console.log('FormData:', req.body);
        const { productId, quantity } = req.body;

        // Debugging: Log received data
        console.log('ProductId:', productId);
        console.log('Quantity:', quantity);

        const cartProducts = await CartProducts.create({
            CartId: cart.id,
            ProductId: productId,
            quantity: quantity
        })


        return res.status(200).send("products added to your cart successfully");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("products NOT added to your cart");
    }
});

// ////
/**
 * @swagger
 * /api/cart/{prodId}:
 *   patch:
 *     summary: Update the quantity of a product in the cart
 *     description: Authenticated users can update the quantity of a product in their cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to update in the cart.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: The new quantity of the product in the cart.
 *             required:
 *               - quantity
 *     responses:
 *       '200':
 *         description: Product quantity updated successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product quantity updated successfully"
 *       '400':
 *         description: Error updating product quantity
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error updating product quantity"
 *       '404':
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *       '401':
 *         description: Access denied due to missing or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
router.patch("/:prodId", async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access Denied");

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        const cart = await Cart.findOne({
            where: {
                UserId: userId
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        // Find the cart product entry
        const cartProduct = await CartProducts.update({ quantity: req.body.quantity },
            {
                where: {
                    CartId: cart.id,
                    ProductId: req.params.prodId
                }
            });

        return res.status(200).send("Product quantity updated successfully");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("Error updating product quantity");
    }
});


// ////

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Retrieve all products in the user's cart
 *     description: Authenticated users can retrieve all products currently in their cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CartId:
 *                     type: integer
 *                     description: The ID of the cart
 *                   ProductId:
 *                     type: integer
 *                     description: The ID of the product
 *                   quantity:
 *                     type: integer
 *                     description: The quantity of the product in the cart
 *                   Product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The ID of the product
 *                       name:
 *                         type: string
 *                         description: The name of the product
 *                       img_url:
 *                         type: string
 *                         description: The URL of the product image
 *                       img_urls:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: The transformed array of image URLs
 *       '400':
 *         description: Error retrieving cart items
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "cart items NOT retrieved"
 *       '404':
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *       '401':
 *         description: Access denied due to missing or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
router.get("/", async (req, res) => {

    const token = req.header("x-auth-token");
    // if(!token) return res.status(401).send("Access Denied");
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userid = decodedPayload.userid;

        const cart = await Cart.findOne({
            where: {
                UserId: userid
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        const cartProducts = await CartProducts.findAll({
            where: {
                CartId: cart.id
            },
            include: [{
                model: Product,
                as: 'Product'
            }]
        });

        // Convert the array of instances to plain JavaScript objects
        const cartProductsData = cartProducts.map(cartProduct => {
            const cartProductJSON = cartProduct.toJSON();
            // Transform the img_url field from a string to an array
            cartProductJSON.Product.img_urls = cartProductJSON.Product.img_url ? cartProductJSON.Product.img_url.split(',') : [];
            return cartProductJSON;
        });

        return res.status(200).json(cartProductsData);


        // return res.status(200).send("cart items retrieved successfully");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("cart items NOT retrieved");
    }
})


/**
 * @swagger
 * /api/cart/{prodId}:
 *   delete:
 *     summary: Remove a product from the cart
 *     description: Authenticated users can remove a specific product from their cart using the product ID.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         description: The ID of the product to remove from the cart
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successfully removed item from the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item deleted successfully"
 *       '400':
 *         description: Error removing item from the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item NOT deleted"
 *       '404':
 *         description: Cart or item not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *       '401':
 *         description: Access denied due to missing or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
router.delete("/:prodId", async (req, res) => {

    const token = req.header("x-auth-token");
    // if(!token) return res.status(401).send("Access Denied");
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userid = decodedPayload.userid;

        const cart = await Cart.findOne({
            where: {
                UserId: userid
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        const cartProducts = await CartProducts.destroy({
            where: {
                CartId: cart.id,
                ProductId: req.params.prodId
            }

        });

        return res.status(200).send("item deleted successfully");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("item NOT deleted");
    }
})

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Empty the cart
 *     description: Authenticated users can remove all products from their cart.
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully emptied the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "The cart emptied"
 *       '400':
 *         description: Error emptying the cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "cart NOT emptied"
 *       '404':
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *       '401':
 *         description: Access denied due to missing or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
router.delete("/", async (req, res) => {

    const token = req.header("x-auth-token");
    // if(!token) return res.status(401).send("Access Denied");
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userid = decodedPayload.userid;

        const cart = await Cart.findOne({
            where: {
                UserId: userid
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        const cartProducts = await CartProducts.destroy({
            where: {
                CartId: cart.id
                // ProductId: req.params.prodId
                // [Op.and]:[{ProductId: req.params.prodId},{CartId: cart.id}]
            }

        });

        return res.status(200).send("The cart emptied");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("cart NOT emptied");
    }
})

module.exports = router;
