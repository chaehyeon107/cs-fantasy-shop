const express = require("express");
const router = express.Router();

router.use("/admin", require("./admin.routes"));
router.use("/auth", require("./auth.routes"));
module.exports = router;
