const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { authGuard, requireRole } = require("../middleware/auth.middleware");
const {
  createItemValidation,
  updateItemValidation,
  itemIdParamValidation,
} = require("../validations/admin.validation");

// 🔐 모든 admin 라우트: JWT + ROLE_ADMIN
router.use(authGuard, requireRole("ROLE_ADMIN"));

// CRUD
router.get("/items", adminController.getItems);

router.post("/items", createItemValidation, adminController.createItem);

router.patch("/items/:id", updateItemValidation, adminController.updateItem);

router.delete(
  "/items/:id",
  itemIdParamValidation,
  adminController.deleteItem
);

module.exports = router;
