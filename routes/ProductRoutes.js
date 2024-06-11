const Product = require("../models/ProductModelDB");
const upload = require("../middleware/upload");
// const ProductsController = require("../controllers/ProductControllerDB");

// auth -> authorization
const auth = require("../middleware/AuthMWPermission");

const express = require('express');
const router = express.Router();

// getAllProductsCategories
router.get("/categories", async (req, res) => {
  try {
    // Get distinct category values using Sequelize
    const categories = await Product.findAll({
      attributes: ["category"], // Select only the "category" attribute
      group: ["category"], // Group results by category for distinct values
    });

    // Extract category values from the results
    const distinctCategories = categories.map(product => product.category);

    res.status(200).send(distinctCategories);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving categories");
  }
});


// getProductByCategory
router.get("/category/:category", async (req, res) => {
  try {
    const product = await Product.findAll({
      where: {
        category: req.params.category,
      },
    });
    if (product) {
      res.status(200).send(product);
    } else {
      return res.status(404).send("Products with this category not found");
    }
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving product");
  }
});




// getAllProducts
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).send(products);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving products");
  }
});

// getProductByID
router.get("/prod/:id", async (req, res) => {
  try {
    const product = await Product.findAll({
      where: {
        id: req.params.id,
      },
    });
    if (product) {
      res.status(200).send(product);
    } else {
      return res.status(404).send("Product with this id not found");
    }
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving product");
  }
});


// to make only admin add MW 
// auth
router.post("/", upload.single("prodimg"), auth, async (req, res) => {
  try {
    const prod = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      img_url: req.file.filename,
      prodimg: req.body.path,
      category: req.body.category,
      type: req.body.type,
      size: req.body.size,
      color: req.body.color,
      quantity: req.body.quantity,
    });
    res.status(200).send("Product added successfully");
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    const message = "Product addition failed. Please check the request data.";
    res.status(400).send(message);
  }
});

// createProduct with MW
// router.post("/", auth, ProductsController.addProduct);


// // updateProductByID
// router.put("/:id", auth, ProductsController.updateProductByID);

// // deleteProductByID
// router.delete("/:id", auth, ProductsController.deleteProductByID);

module.exports = router;