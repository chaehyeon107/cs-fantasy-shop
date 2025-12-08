const express = require("express");
const router = express.Router();

router.use("/admin", require("./admin.routes"));
router.use("/auth", require("./auth.routes"));
router.use("/items", require("./item.routes")); 
router.use("/cart", require("./cart.routes"));
router.use("/orders", require("./order.routes"));
router.use("/inventory", require("./inventory.routes"));


module.exports = router;
