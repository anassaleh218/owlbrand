const express = require('express');
const cors = require('cors');
const router = express();
const db = require ("./config/db");
require("dotenv").config();

// router.use(cors()); 




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

router.use("/api/product", require("./routes/ProductRoutes"));
router.use("/api/user", require("./routes/UserRoutes"));
router.use("/api/auth", require("./routes/Auth"));
router.use("/api/admin", require("./routes/Admin"));



const port= process.env.PORT||3000;

router.listen(port, () => {
  console.log(`listening on ${port}.....!!!`);
});


