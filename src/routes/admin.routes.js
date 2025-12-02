const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminMiddleware = require("../middleware/admin.middleware");

// router.use(adminMiddleware);  // 인증 나중에 붙임

// CRUD
router.get("/items", adminController.getItems);
router.post("/items", adminController.createItem);
router.patch("/items/:id", adminController.updateItem);
router.delete("/items/:id", adminController.deleteItem);

module.exports = router;
