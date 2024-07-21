$("#register").submit(async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post(
            "http://localhost:3000/api/user",
            {
                name,
                email,
                password,
            },
            {
                // headers: {
                //   "x-auth-token": token,
                // },
                contentType: "application/json",
            }
        );


        if (response.data.token && response.data.isAdmin !== undefined) {
            // Check for token and isAdmin existence
            document.cookie = `token=${response.data.token}`;
            document.cookie = `isAdmin=${response.data.isAdmin}`;
            document.cookie = `userName=${response.data.userName}`;
            window.location.href =
                response.data.isAdmin === false ? "products.html" : "add-product.html";
        }

        console.log(response.data);
    } catch (error) {
        console.error("Error: ", error);
        if (error.response) {
            console.error("API Error:", error.response.data);
            showMessage(error.response.data.error || "An unknown error occurred", "danger");
        } else {
            showMessage("An error occurred while connecting to the server", "danger");
        }
    }
});

////
$("#login").submit(async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post(
            "http://localhost:3000/api/auth",
            {
                email,
                password,
            },
            {
                headers: {
                    "x-auth-token": token, // Include token if needed (check original code)
                },
                contentType: "application/json",
            }
        );

        if (response.data.token && response.data.isAdmin !== undefined) {
            // Check for token and isAdmin existence
            document.cookie = `token=${response.data.token}`;
            document.cookie = `isAdmin=${response.data.isAdmin}`;
            document.cookie = `userName=${response.data.userName}`;
            // window.location.href =
            //   data.isAdmin === "false" ? "products.html" : "add-product.html";
            if (response.data.isAdmin === false) {
                window.location.href = "products.html";
            } else {
                window.location.href = "add-product.html";
            }
        }

        console.log(response.data);
    } catch (error) {
        showMessage("Email or Password not Correct", "danger");

        console.error("Error logging in:", error);
        // You can handle specific errors here (e.g., display an error message to the user)
    }
});