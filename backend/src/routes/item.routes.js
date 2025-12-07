// backend/src/routes/item.routes.js
const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

// 공개 아이템 목록 조회 (로그인 불필요)
router.get("/", itemController.listItems);

// 공개 아이템 상세 조회
router.get("/:id", itemController.getItemDetail);

module.exports = router;
