const express = require("express");
const router = express.Router();

router.use("/admin", require("./admin.routes"));
router.use("/auth", require("./auth.routes"));
router.use("/items", require("./item.routes")); 
router.use("/cart", require("./cart.routes"));


module.exports = router;
