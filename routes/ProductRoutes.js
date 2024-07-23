const { Product } = require("../models/ProductModelDB");
const {FavProducts,WatchList} = require("../models/FavWatchModelDB")
const {Feedback} = require("../models/FeedbackModelDB")
const {User} = require("../models/UserModelDB")

const upload = require("../middleware/upload");
const sequelize = require("../config/db");

const { Op } = require('sequelize');
// const ProductsController = require("../controllers/ProductControllerDB");

// auth -> authorization
const auth = require("../middleware/AuthMWPermission");

const express = require('express');
const router = express.Router();

const jwt = require("jsonwebtoken");

// getAllProductsCategories
/**
 * @swagger
 * /api/product/categories:
 *   get:
 *     summary: Retrieve all product categories
 *     description: Retrieves a list of distinct product categories along with the count of products in each category.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of product categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   count:
 *                     type: integer
 *                 example:
 *                   - category: "Electronics"
 *                     count: 15
 *                   - category: "Books"
 *                     count: 10
 *       400:
 *         description: Error retrieving categories
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving categories"
 */
router.get("/categories", async (req, res) => {
  try {
    // Get distinct category values using Sequelize
    const categories = await Product.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "categoryCount"]
      ],
      group: ["category"], // Group results by category for distinct values
    });
    // Extract category values from the results
    const distinctCategories = categories.map(product => ({
      category: product.category,
      count: product.dataValues.categoryCount
    }));

    res.status(200).send(distinctCategories);

  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving categories");
  }
});


// getProductByCategory
/**
 * @swagger
 * /api/product/category/{category}:
 *   get:
 *     summary: Retrieve products by category
 *     description: Retrieves a list of products that belong to the specified category. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: The category of products to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving product"
 */
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        category: req.params.category,
      },
    });

    const transformedProducts = products.map(product => {
      // Clone the product data
      const productData = product.toJSON();

      // Transform the img_url field from a string to an array
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // // Remove the original img_url field if desired
      // delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving product");
  }
});

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Retrieve all products
 *     description: Retrieves a list of all products. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving products"
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    // Transform the img_url field
    const transformedProducts = products.map(product => {
      // Clone the product data
      const productData = product.toJSON();

      // Transform the img_url field from a string to an array
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // // Remove the original img_url field if desired
      // delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving products");
  }
});


// getProductByID
/**
 * @swagger
 * /api/product/prod/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Retrieves a product based on its ID. Transforms `img_url` into an array of image URLs.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Sample Product"
 *                 category:
 *                   type: string
 *                   example: "Electronics"
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 99.99
 *                 img_urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["image1.jpg", "image2.jpg"]
 *                 description:
 *                   type: string
 *                   example: "A detailed description of the product."
 *               example:
 *                 id: 1
 *                 name: "Sample Product"
 *                 category: "Electronics"
 *                 price: 99.99
 *                 img_urls: ["image1.jpg", "image2.jpg"]
 *                 description: "A detailed description of the product."
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product with this id not found"
 *       400:
 *         description: Error retrieving product
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error retrieving product"
 */
router.get("/prod/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      where: {
        id: req.params.id,
      },
    });
    


    if (!product) {
      return res.status(404).send("Product with this id not found");
    }

    // Clone the product data
    const productData = product.toJSON();

    // Transform the img_url field from a string to an array
    productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];


    res.status(200).send(productData);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving product");
  }
});



// to make product - only admin can add - MW 
// auth
/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Add a new product
 *     description: Adds a new product to the database. Only admin users can add products. Requires file uploads for images.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Product"
 *               description:
 *                 type: string
 *                 example: "A detailed description of the new product."
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 49.99
 *               category:
 *                 type: string
 *                 example: "Books"
 *               prodimg:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of product image files
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product added successfully"
 *       400:
 *         description: Product addition failed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product addition failed. Please check the request data."
 *       403:
 *         description: Unauthorized - Only admins can add products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Only admins can add products"
 */
router.post("/", upload.array("prodimg", 10), auth, async (req, res) => {
  try {
    const imgUrls = req.files.map(file => file.filename);
    const prod = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      img_url: imgUrls.join(','), // Save as comma-separated string
      // prodimg: req.body.path,
      category: req.body.category,
    });

    res.status(200).send("Product added successfully");
  } catch (err) {
    console.error('Error:', err);  // Log the complete error for debugging
    res.status(400).send("Product addition failed. Please check the request data.");
  }
});


// fav
/**
 * @swagger
 * /api/product/fav:
 *   post:
 *     summary: Add a product to user favorites
 *     description: Adds a product to the authenticated user's list of favorite products. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - productId
 *     responses:
 *       200:
 *         description: Product added to favorites successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product added to your favorites successfully"
 *       400:
 *         description: Product not added to favorites
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Product NOT added to your favorites"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.post("/fav", async (req, res) => {
  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;

    const favProduct = await FavProducts.create({
      UserId: userid,
      ProductId: req.body.productId,
    });

    return res.status(200).send("Product added to your favorites successfully");
  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("Product NOT added to your favorites");
  }
});

//get myFav Products
/**
 * @swagger
 * /api/product/fav:
 *   get:
 *     summary: Retrieve user's favorite products
 *     description: Retrieves a list of products that the authenticated user has marked as favorites. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of favorite products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Sample Product"
 *                       category:
 *                         type: string
 *                         example: "Electronics"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 99.99
 *                       img_urls:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       description:
 *                         type: string
 *                         example: "A detailed description of the product."
 *               example:
 *                 - Product:
 *                     id: 1
 *                     name: "Sample Product"
 *                     category: "Electronics"
 *                     price: 99.99
 *                     img_urls: ["image1.jpg", "image2.jpg"]
 *                     description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving favorite products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "cart items NOT retrieved"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.get("/fav", async (req, res) => {

  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      const userid = decodedPayload.userid;

      const favProducts = await FavProducts.findAll({
          where: {
              UserId: userid
          },
          include: [{
              model: Product,
              as: 'Product'
          }]
      });

      // Convert the array of instances to plain JavaScript objects
      const favProductsData = favProducts.map(favProduct => {
          const favProductJSON = favProduct.toJSON();
          // Transform the img_url field from a string to an array
          favProductJSON.Product.img_urls = favProductJSON.Product.img_url ? favProductJSON.Product.img_url.split(',') : [];
          return favProductJSON;
      });

      return res.status(200).json(favProductsData);


      // return res.status(200).send("cart items retrieved successfully");

  } catch (err) {
      console.error('Error:', err.message);
      res.status(400).send("cart items NOT retrieved");
  }
})
//

/**
 * @swagger
 * /api/product/fav/{prodId}:
 *   delete:
 *     summary: Remove a product from user's favorites
 *     description: Removes a product from the authenticated user's list of favorite products. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         description: ID of the product to remove from favorites
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product removed from favorites successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item deleted successfully"
 *       400:
 *         description: Error removing the product from favorites
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item NOT deleted"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.delete("/fav/:prodId", async (req, res) => {
  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;


    const favProducts = await FavProducts.destroy({
      where: {
        UserId: userid,
        ProductId: req.params.prodId,
      }

    });

    return res.status(200).send("item deleted successfully");

  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("item NOT deleted");
  }
})


// bookmark
/**
 * @swagger
 * /api/product/watchlist:
 *   post:
 *     summary: Add a product to user watchlist
 *     description: Adds a product to the authenticated user's watchlist. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - productId
 *     responses:
 *       200:
 *         description: Product added to watchlist successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "products added to your Fav successfully"
 *       400:
 *         description: Error adding product to watchlist
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "products NOT added to your Fav"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.post("/watchlist", async (req, res) => {

  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;



    const watchList = await WatchList.create({
      UserId: userid,
      ProductId: req.body.productId,

    })


    return res.status(200).send("products added to your Fav successfully");

  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("products NOT added to your Fav");
  }
});


/**
 * @swagger
 * /api/product/watchlist:
 *   get:
 *     summary: Retrieve user's watchlist items
 *     description: Retrieves a list of products that the authenticated user has added to their watchlist. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of watchlist items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Product:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Sample Product"
 *                       category:
 *                         type: string
 *                         example: "Electronics"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 99.99
 *                       img_urls:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       description:
 *                         type: string
 *                         example: "A detailed description of the product."
 *               example:
 *                 - Product:
 *                     id: 1
 *                     name: "Sample Product"
 *                     category: "Electronics"
 *                     price: 99.99
 *                     img_urls: ["image1.jpg", "image2.jpg"]
 *                     description: "A detailed description of the product."
 *       400:
 *         description: Error retrieving watchlist items
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "cart items NOT retrieved"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.get("/watchlist", async (req, res) => {

  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      const userid = decodedPayload.userid;

      const watchListItems = await WatchList.findAll({
          where: {
              UserId: userid
          },
          include: [{
              model: Product,
              as: 'Product'
          }]
      });

      // Convert the array of instances to plain JavaScript objects
      const watchListData = watchListItems.map(item => {
        const itemJSON = item.toJSON();
        // Transform the img_url field from a string to an array
        itemJSON.Product.img_urls = itemJSON.Product.img_url ? itemJSON.Product.img_url.split(',') : [];
        return itemJSON;
      });
  
      return res.status(200).json(watchListData);

      // return res.status(200).send("cart items retrieved successfully");

  } catch (err) {
      console.error('Error:', err.message);
      res.status(400).send("cart items NOT retrieved");
  }
})


/**
 * @swagger
 * /api/product/watchlist/{prodId}:
 *   delete:
 *     summary: Remove a product from user's watchlist
 *     description: Removes a product from the authenticated user's watchlist. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         description: ID of the product to remove from the watchlist
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product removed from watchlist successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item deleted successfully"
 *       400:
 *         description: Error removing the product from watchlist
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "item NOT deleted"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.delete("/watchlist/:prodId", async (req, res) => {

  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;


    const watchList = await WatchList.destroy({
      where: {
        UserId: userid,
        ProductId: req.params.prodId,
      }

    });

    return res.status(200).send("item deleted successfully");

  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("item NOT deleted");
  }
})



// search = sort
/**
 * @swagger
 * /api/product/searchsort:
 *   get:
 *     summary: Search and sort products
 *     description: Searches for products based on a search query and sorts them according to the specified criteria. Supports optional category filtering.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter products by name
 *         example: "laptop"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum:
 *             - name_asc
 *             - name_desc
 *             - price_asc
 *             - price_desc
 *         description: Sorting criteria for the product list
 *         example: "price_desc"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *         example: "Electronics"
 *     responses:
 *       200:
 *         description: List of products that match the search query and sorting criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Sample Product"
 *                   category:
 *                     type: string
 *                     example: "Electronics"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 99.99
 *                   img_urls:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["image1.jpg", "image2.jpg"]
 *                   description:
 *                     type: string
 *                     example: "A detailed description of the product."
 *               example:
 *                 - id: 1
 *                   name: "Sample Product"
 *                   category: "Electronics"
 *                   price: 99.99
 *                   img_urls: ["image1.jpg", "image2.jpg"]
 *                   description: "A detailed description of the product."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error message"
 */
router.get('/searchsort', async (req, res) => {
  const { search = '', sort_by = '', category = '' } = req.query;

  let order = [];
  if (sort_by === 'name_asc') order = [['name', 'ASC']];
  if (sort_by === 'name_desc') order = [['name', 'DESC']];
  if (sort_by === 'price_asc') order = [['price', 'ASC']];
  if (sort_by === 'price_desc') order = [['price', 'DESC']];

  try {
    const products = await Product.findAll({
      where: {
        category: category || { [Op.ne]: null }, // Ensuring it works even if category is not provided
        name: {
          [Op.like]: `%${search}%`
        }
      },
      order
    });

    const transformedProducts = products.map(product => {
      // Clone the product data
      const productData = product.toJSON();

      // Transform the img_url field from a string to an array
      if (productData.img_url) {
        productData.img_urls = productData.img_url.split(',');
      } else {
        productData.img_urls = [];
      }

      // Remove the original img_url field if desired
      delete productData.img_url;

      return productData;
    });

    res.status(200).send(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//feedback
/**
 * @swagger
 * /api/product/feedback:
 *   post:
 *     summary: Submit feedback for a product
 *     description: Allows an authenticated user to submit feedback and a rating for a specific product. Requires authentication via a JWT token.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product being reviewed
 *                 example: 1
 *               feedback:
 *                 type: string
 *                 description: The feedback text for the product
 *                 example: "Great product, highly recommend!"
 *               rate:
 *                 type: integer
 *                 description: Rating given to the product (1 to 5)
 *                 example: 4
 *             required:
 *               - productId
 *               - feedback
 *               - rate
 *     responses:
 *       200:
 *         description: Feedback added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "feedback on product added successfully"
 *       400:
 *         description: Error adding feedback
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "feedback on product NOT added"
 *       401:
 *         description: Unauthorized - Access denied or invalid token
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized - Access Denied"
 */
router.post("/feedback", async (req, res) => {
  const token = req.header("x-auth-token");
  // if(!token) return res.status(401).send("Access Denied");
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decodedPayload.userid;

    const feedback = await Feedback.create({
      UserId: userid,
      ProductId: req.body.productId,
      feedback: req.body.feedback,
      rate:req.body.rate
    });

    return res.status(200).send("feedback on product added successfully");
  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send("feedback on product NOT added");
  }
});

/**
 * @swagger
 * /api/product/feedbacks/{productId}:
 *   get:
 *     summary: Retrieve all feedbacks for a specific product
 *     description: Fetches all feedbacks and associated user names for a given product ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to retrieve feedbacks for
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: List of feedbacks for the specified product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Feedback ID
 *                     example: 1
 *                   feedback:
 *                     type: string
 *                     description: The feedback text
 *                     example: "Great product, will buy again!"
 *                   rate:
 *                     type: integer
 *                     description: Rating given (1 to 5)
 *                     example: 5
 *                   User:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Name of the user who provided the feedback
 *                         example: "John Doe"
 *               example:
 *                 - id: 1
 *                   feedback: "Great product, will buy again!"
 *                   rate: 5
 *                   User:
 *                     name: "John Doe"
 *       500:
 *         description: Error retrieving feedbacks
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Error fetching feedbacks"
 */
router.get("/feedbacks/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const feedbacks = await Feedback.findAll({
      where: {
        ProductId: productId
      },
      include: {
        model: User,
        attributes: ['name'] // Assuming User model has a 'name' field
      }
    });

    return res.status(200).json(feedbacks);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send("Error fetching feedbacks");
  }
});

// createProduct with MW
// router.post("/", auth, ProductsController.addProduct);


// getAllProducts
// router.get("/", async (req, res) => {
//   try {
//     const products = await Product.findAll();
//     res.status(200).send(products);
//   } catch (err) {
//     console.error(err); // Log the complete error for debugging
//     res.status(400).send("Error retrieving products");
//   }
// });

// // updateProductByID
// router.put("/:id", auth, ProductsController.updateProductByID);

// // deleteProductByID
// router.delete("/:id", auth, ProductsController.deleteProductByID);


module.exports = router;