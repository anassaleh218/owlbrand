const { Product, Size, Color, Type } = require("../models/ProductModelDB");
const upload = require("../middleware/upload");
const sequelize = require("../config/db");
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
    const color = await Color.findAll({where:{productId:product.id}})
    const size = await Size.findAll({where:{productId:product.id}})
    const type = await Type.findAll({where:{productId:product.id}})


    if (!product) {
      return res.status(404).send("Product with this id not found");
    }

    // Clone the product data
    const productData = product.toJSON();
    
    // Transform the img_url field from a string to an array
    productData.img_urls = productData.img_url ? productData.img_url.split(',') : [];


    // Add color, size, and type arrays to the productData
    productData.colors = color.map(c => c.color);
    productData.sizes = size.map(s => s.size);
    productData.types = type.map(t => t.type);
    
    res.status(200).send(productData);
  } catch (err) {
    console.error(err); // Log the complete error for debugging
    res.status(400).send("Error retrieving product");
  }
});



// to make only admin add MW 
// auth
router.post("/", upload.array("prodimg", 10), auth, async (req, res) => {
  let t;
  try {
    console.log('Raw Request Body:', req.body);  // Log the raw request body

    const types = req.body.type;
    const sizes = req.body.size;
    const colors = req.body.color;
    console.log('Extracted types:', types);  // Log extracted types
    console.log('Extracted sizes:', sizes);  // Log extracted sizes
    console.log('Extracted colors:', colors);  // Log extracted colors

    t = await sequelize.transaction();
    const imgUrls = req.files.map(file => file.filename);

    const prod = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      img_url: imgUrls.join(','), // Save as comma-separated string
      // prodimg: req.body.path,
      category: req.body.category,
      // quantity: req.body.quantity,
    }, { transaction: t });

    console.log('Product created with ID:', prod.id);  // Log product ID

    // Sizes
    if (Array.isArray(sizes) && sizes.length > 0) {
      console.log('Sizes array is not empty:', sizes);
      const sizePromises = sizes.map(size => {
        console.log('Creating Size:', size, 'for Product ID:', prod.id);  // Log each size creation
        return Size.create({ size, productId: prod.id }, { transaction: t });
      });
      await Promise.all(sizePromises);
    } else {
      console.log('Sizes array is empty or not defined');
    }

    // Colors
    if (Array.isArray(colors) && colors.length > 0) {
      console.log('Colors array is not empty:', colors);
      const colorPromises = colors.map(color => {
        console.log('Creating Color:', color, 'for Product ID:', prod.id);  // Log each color creation
        return Color.create({ color, productId: prod.id }, { transaction: t });
      });
      await Promise.all(colorPromises);
    } else {
      console.log('Colors array is empty or not defined');
    }

    // Types
    if (Array.isArray(types) && types.length > 0) {
      console.log('Types array is not empty:', types);
      const typePromises = types.map(type => {
        console.log('Creating Type:', type, 'for Product ID:', prod.id);  // Log each type creation
        return Type.create({ type, productId: prod.id }, { transaction: t });
      });
      await Promise.all(typePromises);
    } else {
      console.log('Types array is empty or not defined');
    }

    await t.commit();
    res.status(200).send("Product added successfully");
  } catch (err) {
    if (t) {
      await t.rollback();
    }
    console.error('Error:', err);  // Log the complete error for debugging
    res.status(400).send("Product addition failed. Please check the request data.");
  }
});
// createProduct with MW
// router.post("/", auth, ProductsController.addProduct);


// // updateProductByID
// router.put("/:id", auth, ProductsController.updateProductByID);

// // deleteProductByID
// router.delete("/:id", auth, ProductsController.deleteProductByID);

module.exports = router;