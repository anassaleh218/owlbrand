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
