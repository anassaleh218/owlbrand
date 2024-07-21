const { Cart } = require("../models/CartModelDB");
const { CartProducts } = require("../models/CartProductsModelDB");
const { Order } = require("../models/OrderModelDB");
const { OrderProducts } = require("../models/OrderProductsModelDB");
const { OrderBilling } = require("../models/OrderBillingModelDB");
const { Product } = require("../models/ProductModelDB");
const express = require("express");
const jwt = require("jsonwebtoken");

const bodyParser = require("body-parser");
const { User } = require("../models/UserModelDB");

const router = express.Router();


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/bill", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        const bill = await OrderBilling.create({
            UserId: userId,
            OrderId: req.body.OrderId,
            name: req.body.name,
            phone1: req.body.phone1,
            phone2: req.body.phone2,
            flatNo: req.body.flatNo,
            floorNo: req.body.floorNo,
            buildingNo: req.body.buildingNo,
            street: req.body.street,
            city: req.body.city,
            details: req.body.details,
            totalCost: req.body.totalCost,
            paymentMethod:req.body.paymentMethod
        });
        res.status(200).send("order bill created successfully");
    } catch (err) {

        console.error('Error:', err);  // Log the complete error for debugging
        res.status(400).send("order bill failed. Please check the request data.");
    }
});


//create order
router.post("/", async (req, res) => {
    const token = req.header("x-auth-token");

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Find the user's cart
        const cart = await Cart.findOne({
            where: {
                UserId: userId
            }
        });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        // Create a new order for the user
        const order = await Order.create({ userId: userId, order_status: "Waiting for Confirmation" });

        // Find all cart products for the user's cart
        const cartProducts = await CartProducts.findAll({
            where: {
                CartId: cart.id
            }
        });

        if (cartProducts.length === 0) {
            return res.status(400).send("No products in cart");
        }

        // Map cart products to order products and create them in bulk
        const orderProductsData = cartProducts.map(item => ({
            OrderId: order.id,
            ProductId: item.ProductId,
            quantity: item.quantity
        }));

        await OrderProducts.bulkCreate(orderProductsData);

        // Optionally, you can clear the cart products after moving them to order products
        await CartProducts.destroy({
            where: {
                CartId: cart.id
            }
        });

        return res.status(200).send("Order created and cart products moved successfully");
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("Order creation failed");
    }
});

//get last order
router.get("/", async (req, res) => {

    const token = req.header("x-auth-token");
    // if(!token) return res.status(401).send("Access Denied");
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userid = decodedPayload.userid;

        const order = await Order.findOne({
            where: {
                userId: userid
            },
            order: [['createdAt', 'DESC']]
        });

        if (!order) {
            return res.status(404).send("Cart not found");
        }

        const orderProducts = await OrderProducts.findAll({
            where: {
                OrderId: order.id
            },
            include: [{
                model: Product,
                as: 'Product'
            }]
        });

        // Convert the array of instances to plain JavaScript objects
        const orderProductsData = orderProducts.map(orderProduct => {
            const orderProductJSON = orderProduct.toJSON();
            // Transform the img_url field from a string to an array
            orderProductJSON.Product.img_urls = orderProductJSON.Product.img_url ? orderProductJSON.Product.img_url.split(',') : [];
            return orderProductJSON;
        });

        return res.status(200).json(orderProductsData);


        // return res.status(200).send("cart items retrieved successfully");

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("cart items NOT retrieved");
    }
})

// Get all orders
router.get('/all', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        const ordersBilling = await OrderBilling.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Order,
                    as: 'order', // Use the correct alias for Order model
                    include: [
                        {
                            model: OrderProducts,
                            as: 'orderProducts', // Use the alias defined in Order model for OrderProducts
                            include: [
                                {
                                    model: Product,
                                    as: 'Product' // Use the alias defined in OrderProducts model for Product
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        

        if (!ordersBilling || ordersBilling.length === 0) {
            return res.status(404).send('No orders found for this user');
        }

        // Process the orders to transform img_url fields
        const ordersData = ordersBilling.map(orderBilling => {
            const orderBillingJSON = orderBilling.toJSON();
            orderBillingJSON.order.orderProducts = orderBillingJSON.order.orderProducts.map(orderProduct => {
                orderProduct.Product.img_urls = orderProduct.Product.img_url ? orderProduct.Product.img_url.split(',') : [];
                return orderProduct;
            });
            return orderBillingJSON;
        });

        return res.status(200).json(ordersData);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send('Error retrieving orders');
    }
});

//get specific order
router.get('/:id', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Fetch order details including associated models
        const ordersBilling = await OrderBilling.findOne({
            where: { 
                OrderId: req.params.id,
                UserId: userId // Ensure UserId matches the logged-in user's ID
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Order,
                    as: 'order', // Use the correct alias for Order model
                    include: [
                        {
                            model: OrderProducts,
                            as: 'orderProducts', // Use the alias defined in Order model for OrderProducts
                            include: [
                                {
                                    model: Product,
                                    as: 'Product' // Use the alias defined in OrderProducts model for Product
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        

       // If no order found, return 404
       if (!ordersBilling) {
        return res.status(404).send('No order found for this ID');
    }

    // Process orders to transform img_url fields
    const ordersData = ordersBilling.toJSON();
    ordersData.order.orderProducts = ordersData.order.orderProducts.map(orderProduct => {
        orderProduct.Product.img_urls = orderProduct.Product.img_url ? orderProduct.Product.img_url.split(',') : [];
        return orderProduct;
    });

    // Return processed order data
    return res.status(200).json(ordersData);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send('Error retrieving orders');
    }
});

module.exports = router;
