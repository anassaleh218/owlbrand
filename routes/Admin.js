const express = require("express");
const router = express.Router();
const auth = require("../middleware/AuthMWPermission");
const {User} = require("../models/UserModelDB");

// auth -> authorization
// update user role to admin

router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.update(
      { isAdmin: true },
      { where: { id: req.params.id } }
    );
    if (!user) {
      return res.status(404).send("User not found");
    }

    return res.status(200).send(`${user.name}'s role is set to admin`);
  }
  catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).send("Invalid ID format");
    }

    console.error(err);
    return res.status(500).send("Internal Server Error");
  }

});

module.exports = router;

