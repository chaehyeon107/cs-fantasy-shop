// src/routes/inventory.routes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const { authGuard } = require("../middleware/auth.middleware");

router.use(authGuard);

// 내 인벤토리 조회
router.get("/", inventoryController.getMyInventory);

module.exports = router;
