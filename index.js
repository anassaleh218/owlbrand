const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express();
const db = require ("./config/db");
require("dotenv").config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// router.use(cors()); 

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Serve Swagger UI at /api-docs
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Owl Shop-ecommerce API',
      description: 'Owl Shop Information',
      version: '1.0.0',
      contact: {
        name: 'Developer',
      },
      servers: ['http://localhost:3000'],
    },
  },
  apis: ['./routes/*.js'], // Files containing annotations
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


const allowedOrigins = ['http://127.0.0.1:5500']; // Replace with your frontend origin

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200 // some legacy browsers (IE11) choke on 204
};

router.use(cors(corsOptions));






// important!!!! middleware to parse json to add it 
router.use(express.json());

// app.use('/uploads', express.static('uploads'));

db.authenticate().then(() => {
  db.sync({ alter: true });
  console.log("connect");
})



router.use("/api/user", require("./routes/UserRoutes"));
router.use("/api/auth", require("./routes/Auth"));
router.use("/api/admin", require("./routes/Admin"));
router.use("/api/product", require("./routes/ProductRoutes"));
router.use("/api/cart", require("./routes/CartRoutes"));
router.use("/api/order", require("./routes/OrderRoutes"));




const port= process.env.PORT||3000;

router.listen(port, () => {
  console.log(`listening on ${port}.....!!!`);
});


