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


// Function to fetch categories asynchronously
async function fetchIndexCategories() {
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/product/categories');
    const categories = response.data;

    const categoryCarousel = document.getElementById('categoryCarousel');
    categoryCarousel.innerHTML = ''; // Clear existing categories

    categories.forEach(category => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'card text-center';

      cardDiv.innerHTML = `
        <div>
          <a href="products.html?category=${category.category}" class="btn btn-primary p-3">
             <b>${category.category}</b> <span>(${category.count})</span>
          </a>
        </div>`;

      categoryCarousel.appendChild(cardDiv);
    });

    // Initialize Owl Carousel after successful fetch
    $(document).ready(function () {
      $('.owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
          0: {
            items: 1
          },
          600: {
            items: 3
          },
          1000: {
            items: 5
          }
        }
      })
    })
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}


async function updateTable() {

  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  let url = "http://127.0.0.1:3000/api/product";
  if (category) {
    url += `/category/${category}`;
  }

  try {

    const response = await axios.get(url);
    // 

    const data = response.data;

    if (token && isAdmin == "false") {
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

      updateLoggingProducts(data, favorites, watchlist, cart);
      updateLoggingTrending(data, favorites, watchlist, cart);
      updateLoggingBestSeller(data, favorites, watchlist, cart);

    } else {

      updateNotLoggingTrending(data);
      updateNotLoggingBestSeller(data);
      updateNotLoggingProducts(data);
    }

  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

async function updateNotLoggingProducts(data) {
  $("#card-products").empty();

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
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
      </div>
    </a>
  </div>`;
    $("#card-products").append(cardHtml);
  }
};

async function updateNotLoggingTrending(data) {
  $("#trending").empty();
  const maxProducts = 6; // Maximum number of products to display

  for (let i = 0; i < data.length && i < maxProducts; i++) {
    const product = data[i];
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
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
</div>
</a>
</div>`;
    $("#trending").append(cardHtml);
  }
};


// 
async function updateNotLoggingBestSeller(data) {
  $("#bestSellerCarousel").empty();
  const maxProducts = 10; // Maximum number of products to display

  // Reverse the data array
  const reversedData = data.slice().reverse();

  for (let i = 0; i < reversedData.length && i < maxProducts; i++) {
    const product = reversedData[i];
    const cardHtml = `
      <div class="m-2">
      <a href="single-product.html?prod=${product.id}">
      <div class="card text-center card-product">
        <div class="card-product__img" style="height:250px">
          <img class="img-fluid" src="images/${product.img_urls[0]}" style="
          object-fit: cover;" alt="">

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
            </li>
          </ul>
        </div>
        <div class="card-body">
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
      </div>
      </a>
      </div>
    `;
    $('#bestSellerCarousel').append(cardHtml);
  }


  // Re-initialize Owl Carousel after adding content
  $('#bestSellerCarousel').owlCarousel({
    loop: true,
    margin: 10,
    nav: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 3
      },
      1000: {
        items: 5
      }
    }
  });
}


// 

async function updateLoggingProducts(products, favorites, watchlist, cart) {
  $("#card-products").empty();

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
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
</div>
</a>
</div>`;

    $("#card-products").append(cardHtml);
  }
}

///////////////////////////////////////////////////////////////////
async function updateLoggingTrending(data, favorites, watchlist, cart) {
  $("#trending").empty();
  const maxProducts = 6; // Maximum number of products to display

  const favoriteIds = new Set(favorites.map(fav => fav.ProductId));
  const watchlistIds = new Set(watchlist.map(wl => wl.ProductId));
  const cartIds = new Set(cart.map(item => item.ProductId));


  for (let i = 0; i < data.length && i < maxProducts; i++) {
    const product = data[i];

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
        <button><i class="${cartIconClass}"></i></button>
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

  </ul>
</div>
<div class="card-body">
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
</div>
</a>
</div>`;
    $("#trending").append(cardHtml);
  }
};


// 
async function updateLoggingBestSeller(data, favorites, watchlist, cart) {
  
  const $carousel = $("#bestSellerCarousel");
  
  // Destroy any existing Owl Carousel instance
  $carousel.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
  $carousel.find('.owl-stage-outer').children().unwrap();
  $carousel.removeData();
  
  // $("#bestSellerCarousel").empty();
  // Empty the carousel content
  $carousel.empty();

  const maxProducts = 10; // Maximum number of products to display

  // Reverse the data array
  const reversedData = data.slice().reverse();


  const favoriteIds = new Set(favorites.map(fav => fav.ProductId));
  const watchlistIds = new Set(watchlist.map(wl => wl.ProductId));
  const cartIds = new Set(cart.map(item => item.ProductId));


  for (let i = 0; i < reversedData.length && i < maxProducts; i++) {
    const product = reversedData[i];

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
      <div class="m-2">
      <a href="single-product.html?prod=${product.id}">
      <div class="card text-center card-product">
        <div class="card-product__img" style="height:250px">
          <img class="img-fluid" src="images/${product.img_urls[0]}" style="
          object-fit: cover;" alt="">

          <ul class="card-product__imgOverlay">
            <li>
              <form class="${cartFormClass}" method="post">
                <input type="hidden" name="quantity" value="1">
                <input type="hidden" name="productId" value="${product.id}">
                <button><i class="${cartIconClass}"></i></button>
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
          <p style="color:grey;">${product.category}</p>
          <h4 class="card-product__title">
            <a href="single-product.html?prod=${product.id}">
              ${product.name}
            </a>
          </h4>
          <p class="card-product__price">$ ${product.price}</p>
        </div>
      </div>
      </a>
      </div>
    `;
    $carousel.append(cardHtml);
  }

  // Re-initialize Owl Carousel after adding content
  $carousel.addClass('owl-carousel owl-theme').owlCarousel({
    loop: true,
    margin: 10,
    nav: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 3
      },
      1000: {
        items: 5
      }
    }
  });
}

//////////////////////////////////////////////////////////////////



function showAdminMessage() {
  showMessage("You must not be an admin.", "error");
}

// Use event delegation to handle form submission
$(document).on("submit", ".addtocart", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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
    showMessage("Error you must login or register first.", "error");
  }
});

$(document).on("submit", ".removefromcart", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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

$(document).on("submit", ".addtofav", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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

$(document).on("submit", ".removefromfav", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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

$(document).on("submit", ".addtowl", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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

$(document).on("submit", ".removeFromWatchList", async function (event) {
  event.preventDefault();

  if (isAdmin === "true") {
    showAdminMessage();
    return;
  }

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
  $("#card-products").empty();
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
    .then(async response => {
      // Handle the response to display products
      console.log(response.data);
      const data = response.data;

      if (token && isAdmin == "false") {

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
          },});

          const favorites = favResponse.data;
          const watchlist = watchlistResponse.data;
          const cart = cartResponse.data;

          updateLoggingProducts(data, favorites, watchlist, cart);

      } else {
        updateNotLoggingProducts(data);

      }
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
}
////
async function sortProducts() {
  $("#card-products").empty();
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
        .then(async response => {
      // Handle the response to display products
      console.log(response.data);
      const data = response.data;

      if (token && isAdmin == "false") {

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
          },});

          const favorites = favResponse.data;
          const watchlist = watchlistResponse.data;
          const cart = cartResponse.data;
          
          updateLoggingProducts(data, favorites, watchlist, cart);
        } else {
        updateNotLoggingProducts(data);

      }
     
      })
    .catch(error => {
      console.error('There was an error!', error);
    });
}
