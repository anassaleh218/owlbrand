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


/**
 * @swagger
 * /api/order/bill:
 *   post:
 *     summary: Create a billing record for an order
 *     description: Creates a new billing record for an order. Requires user authentication.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Billing information for the order
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OrderId:
 *                 type: integer
 *                 description: ID of the order
 *                 example: 123
 *               name:
 *                 type: string
 *                 description: Name of the person
 *                 example: John Doe
 *               phone1:
 *                 type: string
 *                 description: Primary phone number
 *                 example: "+1234567890"
 *               phone2:
 *                 type: string
 *                 description: Secondary phone number (optional)
 *                 example: "+0987654321"
 *               flatNo:
 *                 type: string
 *                 description: Flat number
 *                 example: "101"
 *               floorNo:
 *                 type: string
 *                 description: Floor number
 *                 example: "1"
 *               buildingNo:
 *                 type: string
 *                 description: Building number
 *                 example: "12"
 *               street:
 *                 type: string
 *                 description: Street address
 *                 example: "Main St"
 *               city:
 *                 type: string
 *                 description: City
 *                 example: "New York"
 *               details:
 *                 type: string
 *                 description: Additional details or instructions
 *                 example: "Leave at the front door."
 *               totalCost:
 *                 type: number
 *                 format: float
 *                 description: Total cost of the order
 *                 example: 250.75
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method used
 *                 example: "Credit Card"
 *             required:
 *               - OrderId
 *               - name
 *               - phone1
 *               - flatNo
 *               - street
 *               - city
 *               - totalCost
 *               - paymentMethod
 *     responses:
 *       200:
 *         description: Order bill created successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "order bill created successfully"
 *       400:
 *         description: Order bill creation failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "order bill failed. Please check the request data."
 *       401:
 *         description: Unauthorized access
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
/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order for the authenticated user. The order is created based on the user's cart, and cart products are moved to the order.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order created and cart products moved successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Order created and cart products moved successfully"
 *       400:
 *         description: Order creation failed or no products in cart
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Order creation failed" 
 *       404:
 *         description: Cart not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cart not found"
 *       401:
 *         description: Unauthorized access
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
/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Get the last order for the authenticated user
 *     description: Retrieves the most recent order for the authenticated user, including order details and associated products.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the last order and its products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   OrderId:
 *                     type: integer
 *                     description: ID of the order
 *                   ProductId:
 *                     type: integer
 *                     description: ID of the product
 *                   quantity:
 *                     type: integer
 *                     description: Quantity of the product in the order
 *                   Product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the product
 *                       name:
 *                         type: string
 *                         description: Name of the product
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Price of the product
 *                       img_urls:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of image URLs for the product
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Order not found"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving order"
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
/**
 * @swagger
 * /api/order/all:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     description: Retrieves all orders, including billing details and associated products, for the authenticated user.
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   OrderBilling:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the order billing
 *                       OrderId:
 *                         type: integer
 *                         description: ID of the order
 *                       UserId:
 *                         type: integer
 *                         description: ID of the user
 *                       name:
 *                         type: string
 *                         description: Name of the person for billing
 *                       phone1:
 *                         type: string
 *                         description: Primary phone number
 *                       phone2:
 *                         type: string
 *                         description: Secondary phone number
 *                       flatNo:
 *                         type: string
 *                         description: Flat number
 *                       floorNo:
 *                         type: string
 *                         description: Floor number
 *                       buildingNo:
 *                         type: string
 *                         description: Building number
 *                       street:
 *                         type: string
 *                         description: Street name
 *                       city:
 *                         type: string
 *                         description: City name
 *                       details:
 *                         type: string
 *                         description: Additional details
 *                       totalCost:
 *                         type: number
 *                         format: float
 *                         description: Total cost of the order
 *                       paymentMethod:
 *                         type: string
 *                         description: Payment method used
 *                       order:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID of the order
 *                           userId:
 *                             type: integer
 *                             description: ID of the user
 *                           order_status:
 *                             type: string
 *                             description: Status of the order
 *                           orderProducts:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 OrderId:
 *                                   type: integer
 *                                   description: ID of the order
 *                                 ProductId:
 *                                   type: integer
 *                                   description: ID of the product
 *                                 quantity:
 *                                   type: integer
 *                                   description: Quantity of the product
 *                                 Product:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                       description: ID of the product
 *                                     name:
 *                                       type: string
 *                                       description: Name of the product
 *                                     price:
 *                                       type: number
 *                                       format: float
 *                                       description: Price of the product
 *                                     img_urls:
 *                                       type: array
 *                                       items:
 *                                         type: string
 *                                       description: List of image URLs for the product
 *       404:
 *         description: No orders found for the user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "No orders found for this user"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving orders"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
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
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: Get a specific order by ID for the authenticated user
 *     description: Retrieves details of a specific order, including billing information and associated products, for the authenticated user.
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to retrieve
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 OrderBilling:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the order billing
 *                     OrderId:
 *                       type: integer
 *                       description: ID of the order
 *                     UserId:
 *                       type: integer
 *                       description: ID of the user
 *                     name:
 *                       type: string
 *                       description: Name of the person for billing
 *                     phone1:
 *                       type: string
 *                       description: Primary phone number
 *                     phone2:
 *                       type: string
 *                       description: Secondary phone number
 *                     flatNo:
 *                       type: string
 *                       description: Flat number
 *                     floorNo:
 *                       type: string
 *                       description: Floor number
 *                     buildingNo:
 *                       type: string
 *                       description: Building number
 *                     street:
 *                       type: string
 *                       description: Street name
 *                     city:
 *                       type: string
 *                       description: City name
 *                     details:
 *                       type: string
 *                       description: Additional details
 *                     totalCost:
 *                       type: number
 *                       format: float
 *                       description: Total cost of the order
 *                     paymentMethod:
 *                       type: string
 *                       description: Payment method used
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID of the order
 *                         userId:
 *                           type: integer
 *                           description: ID of the user
 *                         order_status:
 *                           type: string
 *                           description: Status of the order
 *                         orderProducts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               OrderId:
 *                                 type: integer
 *                                 description: ID of the order
 *                               ProductId:
 *                                 type: integer
 *                                 description: ID of the product
 *                               quantity:
 *                                 type: integer
 *                                 description: Quantity of the product
 *                               Product:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     description: ID of the product
 *                                   name:
 *                                     type: string
 *                                     description: Name of the product
 *                                   price:
 *                                     type: number
 *                                     format: float
 *                                     description: Price of the product
 *                                   img_urls:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *                                     description: List of image URLs for the product
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "No order found for this ID"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Access Denied"
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving orders"
 *     components:
 *       securitySchemes:
 *         bearerAuth:
 *           type: http
 *           scheme: bearer
 *           bearerFormat: JWT
 */
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
