// async function getCategories() {
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:3000/api/product/categories"
//       );
//       const data = response.data;

//       for (const category of data) {
//         const cardHtml = `
//       <li class="filter-list">
//         <a href="?category=${category}">
//           <span> ${category}</span>
//         </a>
//       </li>`;
//         $("#cat").append(cardHtml);
//       }
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   }

  async function fetchCategories() {
    try {
      const response = await axios.get('http://127.0.0.1:3000/api/product/categories');
      const categories = response.data;

      const categoriesList = document.getElementById('categoriesList');
      categoriesList.innerHTML = ''; // Clear existing categories

      const urlParams = new URLSearchParams(window.location.search);
        const currentCategoryId = urlParams.get('category'); // Get category ID from URL

        categories.forEach(category => {
          const listItem = document.createElement('li');
          listItem.className = 'filter-list';

          listItem.innerHTML = `
            <a target="_self" href="products.html?category=${category.category}">
              <input class="pixel-radio" type="radio" name="categoryName" value="${category.category}" ${currentCategoryId == category.category ? 'checked' : ''}>
              <label for="${category.category}">${category.category}<span>(${category.count})</span></label>
            </a>
          `;

        categoriesList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  // Fetch categories when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', fetchCategories);

async function updateTable() {

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    let url = "http://127.0.0.1:3000/api/product";
    if (category) {
      url += `/category/${category}`;
    }

    try {

      const response = await axios.get(url, {
        headers: {
          "x-auth-token": token,
        },
      });
      // 

      const data = response.data;

      if (token) {
        const favResponse = await axios.get("http://127.0.0.1:3000/api/product/fav", {
          headers: {
            "x-auth-token": token,
          },
        });

        const watchlistResponse = await axios.get("http://127.0.0.1:3000/api/product/watchlist", {
          headers: {
            "x-auth-token": token,
          },
        });

        const cartResponse = await axios.get("http://127.0.0.1:3000/api/cart", {
          headers: {
            "x-auth-token": token,
          },
        });


        const favorites = favResponse.data;
        const watchlist = watchlistResponse.data;
        const cart = cartResponse.data;

        update(data, favorites, watchlist, cart);

      } else {

        updateNotLogging(data);
      }

    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

async function updateNotLogging(data) {
  $("#card").empty();
  for (const product of data) {
    const cardHtml = `
  <div class="col-md-6 col-lg-4">
<a href="single-product.html?prod=${product.id}">
<div class="card text-center card-product">
<div class="card-product__img">
  <img class="card-img" width="500" src="images/${product.img_urls[0]}" style="width: 200px;height: 250px;object-fit: cover;" alt="">
  <ul class="card-product__imgOverlay">
    <li>
      <form class="addtocart" method="post">
        <input type="hidden" name="quantity" value="1">
        <input type="hidden" name="productId" value="${product.id}">
        <button><i class="ti-shopping-cart"></i></button>
      </form>
    </li>
    <li>
      <form class="addtowl" method="post">
        <input type="hidden" name="productId" value="${product.id}">
        <button type="submit"><i class="fa-regular fa-bookmark"></i></button>
      </form>
    </li>
    <li>
      <form class="addtofav" method="post">
        <input type="hidden" name="productId" value="${product.id}">
        <button type="submit"><i class="ti-heart"></i></button>
      </form>

  </ul>
</div>
<div class="card-body">
  <p>ID: ${product.id}</p>
  <h4 class="card-product__title">
    <a href="single-product.html?prod=${product.id}">
          Name: ${product.name}
        </a></h4>
  <p>Quantity: ${product.quantity}</p>
  <p>Desc: ${product.description}</p>
</div>
</div>
</a>
</div>`;
    $("#card").append(cardHtml);
  }
};


async function update(products, favorites, watchlist, cart) {
  $("#card").empty();

  const favoriteIds = new Set(favorites.map(fav => fav.ProductId));
  const watchlistIds = new Set(watchlist.map(wl => wl.ProductId));
  const cartIds = new Set(cart.map(item => item.ProductId));

  for (const product of products) {
    const isFavorite = favoriteIds.has(product.id);
    const isWatchlist = watchlistIds.has(product.id);
    const isInCart = cartIds.has(product.id);

    const heartIconClass = isFavorite ? 'ti-heart-broken' : 'ti-heart';
    const bookmarkIconClass = isWatchlist ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
    const cartIconClass = isInCart ? 'ti-shopping-cart-full' : 'ti-shopping-cart';

    const favFormClass = isFavorite ? 'removefromfav' : 'addtofav';
    const wlFormClass = isWatchlist ? 'removeFromWatchList' : 'addtowl';
    const cartFormClass = isInCart ? 'removefromcart' : 'addtocart';

    const cardHtml = `
<div class="col-md-6 col-lg-4">
<a href="single-product.html?prod=${product.id}">
<div class="card text-center card-product">
  <div class="card-product__img">
    <img class="card-img" width="500" src="images/${product.img_urls[0]}" style="width: 200px;height: 250px;object-fit: cover;" alt="">
    <ul class="card-product__imgOverlay">
      <li>
        <form class="${cartFormClass}" method="post">
          <input type="hidden" name="quantity" value="1">
          <input type="hidden" name="productId" value="${product.id}">
          <button type="submit"><i class="${cartIconClass}"></i></button>
        </form>
      </li>
      <li>
        <form class="${wlFormClass}" method="post">
          <input type="hidden" name="productId" value="${product.id}">
          <button type="submit"><i class="${bookmarkIconClass}"></i></button>
        </form>
      </li>
      <li>
        <form class="${favFormClass}" method="post">
          <input type="hidden" name="productId" value="${product.id}">
          <button type="submit"><i class="${heartIconClass}"></i></button>
        </form>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <p>ID: ${product.id}</p>
    <h4 class="card-product__title">
      <a href="single-product.html?prod=${product.id}">
        Name: ${product.name}
      </a>
    </h4>
    <p>Quantity: ${product.quantity}</p>
    <p>Desc: ${product.description}</p>
  </div>
</div>
</a>
</div>`;

    $("#card").append(cardHtml);
  }
}





// Use event delegation to handle form submission
$(document).on("submit", ".addtocart", async function (event) {
  event.preventDefault();

  const url = "http://127.0.0.1:3000/api/cart";
  const formData = $(this).serializeArray();
  const data = {};

  formData.forEach((item) => {
    data[item.name] = item.value;
  });

  // Debugging: Log the serialized data
  console.log('Serialized Data:', data);

  try {
    const response = await axios.post(url, data, {
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",  // Ensure we send JSON data
      }
    });

    if (response.status === 200) {
      showMessage("Product added to cart successfully!", "success");
    } else {
      showMessage("Failed to add product to cart. Please try again.", "error");
    }

    updateTable(); // Ensure this function exists and updates your UI as needed
    cartIcon();
  } catch (error) {
    console.error("Error adding to cart:", error);
    showMessage("Error  you must login or register first.", "error");
  }
});

//

$(document).on("submit", ".removefromcart", async function (event) {
  event.preventDefault();

  const form = $(this);
  const productId = form.find('input[name="productId"]').val();
  const url = `http://127.0.0.1:3000/api/cart/${productId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (response.status === 200) {
      console.log("Item removed successfully");
      showMessage("Product removed from cart successfully!", "success");

    } else {
      console.log("Failed to remove the item");
      showMessage("Failed to remove product from cart. Please try again.", "error");

    }
    
    updateTable(); // Refresh the table to show the updated cart items
      cartIcon();
  } catch (error) {
    console.error("Error removing the item:", error);
  }
});

// 
$(document).on("submit", ".addtofav", async function (event) {
  event.preventDefault();

  const url = "http://127.0.0.1:3000/api/product/fav";
  const formData = $(this).serializeArray();
  const data = {};

  formData.forEach((item) => {
    data[item.name] = item.value;
  });

  // Debugging: Log the serialized data
  console.log('Serialized Data:', data);

  try {
    const response = await axios.post(url, data, {
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",  // Ensure we send JSON data
      }
    });
    console.log(response.data);
    updateTable(); // Ensure this function exists and updates your UI as needed
    showMessage("Product added to Favourites successfully!", "success");
  } catch (error) {
    console.error("Error adding to fav:", error);
    showMessage("Error you must login or register first.", "error");

  }
});
//
$(document).on("submit", ".removefromfav", async function (event) {
  event.preventDefault();

  const form = $(this);
  const productId = form.find('input[name="productId"]').val();
  const url = `http://127.0.0.1:3000/api/product/fav/${productId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (response.status === 200) {
      console.log("Item removed successfully");

      updateTable(); // Refresh the table to show the updated cart items
      showMessage("Product removed from Favourites successfully!", "success");

    } else {
      console.log("Failed to remove the item");
    }
  } catch (error) {

    console.error("Error removing the item:", error);
  }
});

// 
// 
$(document).on("submit", ".addtowl", async function (event) {
  event.preventDefault();

  const url = "http://127.0.0.1:3000/api/product/watchlist";
  const formData = $(this).serializeArray();
  const data = {};

  formData.forEach((item) => {
    data[item.name] = item.value;
  });

  // Debugging: Log the serialized data
  console.log('Serialized Data:', data);

  try {
    const response = await axios.post(url, data, {
      headers: {
        "x-auth-token": token,
        "Content-Type": "application/json",  // Ensure we send JSON data
      }
    });
    console.log(response.data);
    updateTable(); // Ensure this function exists and updates your UI as needed
    showMessage("Product added to WatchList successfully!", "success");
  } catch (error) {
    console.error("Error adding to wl:", error);
    showMessage("Error you must login or register first.", "error");

  }
});
//
$(document).on("submit", ".removeFromWatchList", async function (event) {
  event.preventDefault();

  const form = $(this);
  const productId = form.find('input[name="productId"]').val();
  const url = `http://127.0.0.1:3000/api/product/watchlist/${productId}`;

  try {
    const response = await axios.delete(url, {
      headers: {
        "x-auth-token": token,
      },
    });

    if (response.status === 200) {
      console.log("Item removed successfully");

      updateTable(); // Refresh the table to show the updated cart items
      showMessage("Product removed from WatchList successfully!", "success");

    } else {
      console.log("Failed to remove the item");
    }
  } catch (error) {
    console.error("Error removing the item:", error);
  }
});

//////////////////////////////////
async function searchProducts() {
    $("#card").empty();
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    const search = document.getElementById('searchInput').value;
    const sort_by = document.getElementById('sortSelect').value;

    axios.get('http://127.0.0.1:3000/api/product/searchsort', {
      params: {
        search: search,
        sort_by: sort_by,
        category: category
      }
    })
      .then(response => {
        // Handle the response to display products
        console.log(response.data);
        const data = response.data;
        update(data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }
  ////
  async function sortProducts() {
    $("#card").empty();
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    const search = document.getElementById('searchInput').value;
    const sort_by = document.getElementById('sortSelect').value;

    axios.get('http://127.0.0.1:3000/api/product/searchsort', {
      params: {
        search: search,
        sort_by: sort_by,
        category: category
      }
    })
      .then(response => {
        // Handle the response to display products
        console.log(response.data);
        const data = response.data;
        update(data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }
