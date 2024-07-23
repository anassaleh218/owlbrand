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

//
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